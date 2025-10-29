# from fastapi import FastAPI, HTTPException, Depends, Header
# from pydantic import BaseModel
# from supabase import create_client, Client
# from decouple import config
# from fastapi.middleware.cors import CORSMiddleware

# # --- No more JWT, Clerk, or Passlib imports ---

# # Load keys from .env file
# SUPABASE_URL = config('SUPABASE_URL')
# SUPABASE_KEY = config('SUPABASE_KEY')

# # --- CLIENT SETUP ---
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
# app = FastAPI()

# # # --- CORS Middleware ---
# # origins = [
# #     "http://localhost:3000",
# #     "https://stash-frontend-chi.vercel.app"
# # ]

# origins = ["*"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- Pydantic Models ---
# class UserAuth(BaseModel):
#     email: str
#     password: str

# class CaptureItem(BaseModel):
#     type: str
#     content: str

# # --- Simple Auth "Guard" ---
# async def get_current_user_email(x_user_email: str | None = Header(None, alias="X-User-Email")) -> str:
#     """
#     Gets the user's email from the X-User-Email header.
#     For the hackathon, we just trust this header.
#     """
#     if not x_user_email:
#         raise HTTPException(status_code=401, detail="X-User-Email header missing")
#     return x_user_email

# # --- Endpoint: Signup ---
# # --- Endpoint: Signup (FIXED) ---
# @app.post("/v1/signup")
# async def signup(user: UserAuth):
#     """
#     Creates a new user in the 'users' table.
#     Handles Supabase v2 insert response correctly.
#     """
#     try:
#         # Execute the insert operation
#         response = supabase.table('users').insert({
#             'email': user.email,
#             'password': user.password # INSECURE: Storing plain text
#         }).execute()

#         # --- FIX: Check the response data correctly ---
#         # The actual inserted data is in response.data
#         if response.data and len(response.data) > 0:
#             # Successfully inserted, return the email
#             return {"email": response.data[0]['email']}
#         else:
#             # If response.data is empty or missing, something went wrong
#             # Log the full response if possible for debugging
#             print(f"Signup Supabase Error: Unexpected response structure: {response}")
#             raise HTTPException(status_code=500, detail="Signup failed on database insert.")

#     except HTTPException as http_exc:
#          # Re-raise HTTP exceptions directly (like 409 Conflict)
#          raise http_exc
#     except Exception as e:
#         # Check specifically for the unique constraint violation from Postgres/Supabase
#         if 'duplicate key value violates unique constraint "users_email_key"' in str(e):
#             raise HTTPException(status_code=409, detail="Email already exists")
        
#         # Log other types of errors
#         print(f"Signup Error (Generic): {e}")
#         raise HTTPException(status_code=500, detail="An unexpected error occurred during signup.")

# # --- Endpoint: Login ---
# @app.post("/v1/login")
# async def login(user: UserAuth):
#     """
#     Logs a user in by checking email and password.
#     """
#     try:
#         data, count = supabase.table('users') \
#             .select('*') \
#             .eq('email', user.email) \
#             .limit(1) \
#             .execute()

#         if not data or not data[1]:
#             raise HTTPException(status_code=404, detail="Email not found")
        
#         db_user = data[1][0]

#         if db_user['password'] == user.password:
#             return {"email": db_user['email']}
#         else:
#             raise HTTPException(status_code=401, detail="Incorrect password")
#     except Exception as e:
#         if isinstance(e, HTTPException): raise e
#         print(f"Login Error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# # --- Endpoint: Capture Item ---
# @app.post("/v1/capture")
# async def capture_item(
#     item: CaptureItem, 
#     user_email: str = Depends(get_current_user_email) # Use the simple guard
# ):
#     try:
#         data, count = supabase.table('items').insert({
#             'content_type': item.type,
#             'raw_content': item.content,
#             'status': 'pending',
#             'user_email': user_email  # Use email as the foreign key
#         }).execute()
        
#         if data and len(data) > 1 and data[1]:
#              return {"status": "success", "data": data[1]}
#         else:
#             return {"status": "success", "data": "Item captured"}
#     except Exception as e:
#         print(f"Error capturing item: {e}") 
#         raise HTTPException(status_code=500, detail=str(e))

# # --- Endpoint: Get Library ---
# @app.get("/v1/library")
# async def get_library(
#     user_email: str = Depends(get_current_user_email) # Use the simple guard
# ):
#     try:
#         data, count = supabase.table('items') \
#             .select('*') \
#             .eq('user_email', user_email) \
#             .order('created_at', desc=True) \
#             .execute()
        
#         return {"items": data[1]} 
#     except Exception as e:
#         print(f"Error fetching library: {e}") 
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/")
# async def root():
#     return {"message": "Stash Backend API is running!"}








import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import json
from datetime import datetime # Needed for background task logging

from fastapi import FastAPI, HTTPException, Depends, Header, BackgroundTasks
from pydantic import BaseModel
from supabase import create_client, Client
from decouple import config
from fastapi.middleware.cors import CORSMiddleware

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.common.exceptions import WebDriverException, TimeoutException
import time

# --- Load keys from .env file ---
try:
    SUPABASE_URL = config('SUPABASE_URL')
    SUPABASE_KEY = config('SUPABASE_KEY')
    GEMINI_API_KEY = config('GEMINI_API_KEY')
    if not SUPABASE_URL or not SUPABASE_KEY or not GEMINI_API_KEY:
        raise ValueError("Supabase URL/Key and Gemini API Key must be set in .env file")
except Exception as e:
    print(f"FATAL: Error loading environment variables: {e}")
    exit()

# --- Client Setups ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)
app = FastAPI()

# --- CORS Middleware ---
origins = [
    "http://localhost:3000",
    "https://stashfronrtend.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class UserAuth(BaseModel):
    email: str
    password: str

class CaptureItem(BaseModel):
    type: str
    content: str

# --- Simple Auth "Guard" ---
async def get_current_user_email(x_user_email: str | None = Header(None, alias="X-User-Email")) -> str:
    if not x_user_email:
        raise HTTPException(status_code=401, detail="X-User-Email header missing")
    return x_user_email

# --- Scraper Function (from ai_test.py) ---
# def get_text_from_url(url):
#     try:
#         headers = {
#             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
#             'Accept-Language': 'en-US,en;q=0.9',
#             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
#         }
#         response = requests.get(url, headers=headers, timeout=20)
#         response.raise_for_status()
#         soup = BeautifulSoup(response.content, 'lxml')
#         for element in soup(["script", "style", "nav", "footer", "header", "aside", "form", "button"]):
#             element.decompose()
#         main_content = soup.find('main') or soup.find('article') or soup.find('div', role='main') or soup.body
#         text = main_content.get_text(separator='\n', strip=True) if main_content else soup.get_text(separator='\n', strip=True)
#         lines = (line.strip() for line in text.splitlines())
#         chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
#         cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
#         return cleaned_text[:15000]
#     except requests.exceptions.Timeout:
#         print(f"Timeout error fetching URL {url}")
#         return None
#     except requests.exceptions.RequestException as e:
#         print(f"Scraping Error for {url}: {e}")
#         return None
#     except Exception as e:
#         print(f"Unexpected Scraping Error for {url}: {e}")
#         return None


def get_text_from_url_fallback(url):
    """
    Fallback function using requests + BeautifulSoup when Selenium fails.
    Works well for static content but won't execute JavaScript.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'lxml')
        for element in soup(["script", "style", "nav", "footer", "header", "aside", "form", "button"]):
            element.decompose()
        main_content = soup.find('main') or soup.find('article') or soup.find('div', role='main') or soup.body
        text = main_content.get_text(separator='\n', strip=True) if main_content else soup.get_text(separator='\n', strip=True)
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
        print(f"Successfully loaded URL with BeautifulSoup fallback. Got {len(cleaned_text)} chars.")
        return cleaned_text[:15000]
    except requests.exceptions.Timeout:
        print(f"Timeout error fetching URL {url} with fallback")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Scraping Error for {url} with fallback: {e}")
        return None
    except Exception as e:
        print(f"Unexpected Scraping Error for {url} with fallback: {e}")
        return None


def get_text_from_url(url):
    """
    Uses Selenium to load the page (including JS) and extract text.
    Falls back to BeautifulSoup if Selenium is not available or fails.
    """
    print(f"Attempting to load URL with Selenium: {url}")
    options = webdriver.ChromeOptions()
    
    # Production-ready Chrome options for headless operation
    options.add_argument('--headless=new')  # Use new headless mode
    options.add_argument('--no-sandbox')  # Required for Linux servers
    options.add_argument('--disable-dev-shm-usage')  # Overcome limited resource problems
    options.add_argument('--disable-gpu')  # Disable GPU hardware acceleration
    options.add_argument('--disable-software-rasterizer')  # Disable software rasterization
    options.add_argument('--disable-extensions')  # Disable extensions
    options.add_argument('--disable-images')  # Don't load images (faster)
    options.add_argument('--window-size=1920,1080')  # Set a standard window size
    options.add_argument('--disable-blink-features=AutomationControlled')  # Avoid detection
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    # Additional options for server environments
    options.add_argument('--disable-setuid-sandbox')
    options.add_argument('--remote-debugging-port=9222')  # Allow remote debugging if needed
    # Note: --single-process can cause stability issues, removed for better reliability
    
    # Set preferences
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_experimental_option('useAutomationExtension', False)

    driver = None
    try:
        import os
        import shutil
        
        # Find Chrome/Chromium binary
        chrome_paths = [
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/usr/bin/google-chrome',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        ]
        
        chrome_binary = None
        for chrome_path in chrome_paths:
            if os.path.exists(chrome_path) and os.access(chrome_path, os.X_OK):
                chrome_binary = chrome_path
                print(f"Found Chrome at {chrome_path}")
                options.binary_location = chrome_path
                break
        
        if not chrome_binary:
            raise Exception("Could not find Chrome/Chromium binary. Falling back to BeautifulSoup.")
        
        # Try to get chromedriver
        chromedriver_path = None
        
        # Method 1: Try ChromeDriverManager
        try:
            chromedriver_path = ChromeDriverManager().install()
            print(f"ChromeDriverManager installed chromedriver at: {chromedriver_path}")
        except Exception as manager_error:
            print(f"ChromeDriverManager failed: {manager_error}")
            # Method 2: Try to find chromedriver in common locations
            chromedriver_paths = [
                '/usr/bin/chromedriver',
                '/usr/local/bin/chromedriver',
                shutil.which('chromedriver'),
            ]
            for path in chromedriver_paths:
                if path and os.path.exists(path) and os.access(path, os.X_OK):
                    chromedriver_path = path
                    print(f"Found chromedriver at: {path}")
                    break
        
        if not chromedriver_path:
            raise Exception("Could not find chromedriver. Falling back to BeautifulSoup.")
        
        # Create service with chromedriver
        service = ChromeService(chromedriver_path)
        
        # Add retry logic for driver creation
        max_retries = 2
        for attempt in range(max_retries):
            try:
                driver = webdriver.Chrome(service=service, options=options)
                print("Successfully created Chrome WebDriver")
                break
            except Exception as driver_error:
                if attempt == max_retries - 1:
                    raise driver_error
                print(f"Driver creation attempt {attempt + 1} failed: {driver_error}, retrying...")
                time.sleep(1)

        # Set timeouts - increased for slow-loading pages
        driver.set_page_load_timeout(60)  # Increased from 30 to 60 seconds
        driver.implicitly_wait(10)  # Wait for elements to appear
        driver.set_script_timeout(30)  # Timeout for JavaScript execution
        
        # Navigate to URL with timeout handling
        print(f"Loading URL: {url}")
        try:
            driver.get(url)
            print("Page loaded successfully")
        except TimeoutException as timeout_error:
            print(f"Page load timeout (60s exceeded): {timeout_error}")
            print("Attempting to extract content from partially loaded page...")
            # Sometimes the page loads enough HTML even if it times out
            # We'll try to extract what we can from page_source
            try:
                page_source = driver.page_source
                if page_source and len(page_source) > 100:
                    print("Got page_source despite timeout, will extract from it")
                else:
                    raise timeout_error
            except:
                raise timeout_error

        # Wait for JavaScript to potentially load content
        # Increase wait time for dynamic content
        time.sleep(3)

        # Extract text from the body tag
        try:
            # Wait a bit more for dynamic content
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            
            # Wait for body to be present
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, 'body'))
            )
            
            body_element = driver.find_element(By.TAG_NAME, 'body')
            text = body_element.text.strip()
            
            if not text or len(text.strip()) < 10:
                print("Warning: Got minimal or no text from Selenium, trying page_source")
                # Fallback: get text from page source
                from bs4 import BeautifulSoup as BS
                soup = BS(driver.page_source, 'html.parser')
                for element in soup(["script", "style", "nav", "footer", "header", "aside", "form", "button"]):
                    element.decompose()
                main_content = soup.find('main') or soup.find('article') or soup.find('body')
                text = main_content.get_text(separator='\n', strip=True) if main_content else ''
            
            lines = (line.strip() for line in text.splitlines())
            cleaned_text = '\n'.join(line for line in lines if line)

            print(f"Successfully loaded URL with Selenium. Got {len(cleaned_text)} chars.")
            return cleaned_text[:15000]
        except Exception as extract_error:
            print(f"Error extracting text: {extract_error}")
            # Try one more time with page_source
            try:
                from bs4 import BeautifulSoup as BS
                soup = BS(driver.page_source, 'html.parser')
                for element in soup(["script", "style"]):
                    element.decompose()
                text = soup.get_text(separator='\n', strip=True)
                lines = (line.strip() for line in text.splitlines())
                cleaned_text = '\n'.join(line for line in lines if line)
                print(f"Extracted text from page_source. Got {len(cleaned_text)} chars.")
                return cleaned_text[:15000]
            except:
                raise extract_error

    except TimeoutException as e:
        print(f"Selenium timeout error for URL {url}: {e}")
        # Try to extract from page_source if driver exists
        if driver:
            try:
                print("Attempting to extract from page_source after timeout...")
                from bs4 import BeautifulSoup as BS
                soup = BS(driver.page_source, 'html.parser')
                for element in soup(["script", "style", "nav", "footer", "header", "aside", "form", "button"]):
                    element.decompose()
                main_content = soup.find('main') or soup.find('article') or soup.find('body')
                text = main_content.get_text(separator='\n', strip=True) if main_content else soup.get_text(separator='\n', strip=True)
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
                if cleaned_text and len(cleaned_text) > 100:
                    print(f"Successfully extracted text from timed-out page. Got {len(cleaned_text)} chars.")
                    return cleaned_text[:15000]
            except Exception as extract_err:
                print(f"Could not extract from timed-out page: {extract_err}")
        print("Falling back to BeautifulSoup...")
        return get_text_from_url_fallback(url)
    except WebDriverException as e:
        print(f"Selenium WebDriver error for URL {url}: {e}")
        print("Falling back to BeautifulSoup...")
        return get_text_from_url_fallback(url)
    except Exception as e:
        print(f"An unexpected error occurred processing URL {url} with Selenium: {e}")
        print("Falling back to BeautifulSoup...")
        return get_text_from_url_fallback(url)
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass


# --- Gemini Configuration (from ai_test.py) ---
generation_config = {
  "temperature": 0.2, "top_p": 1, "top_k": 1, "max_output_tokens": 2048,
  "response_mime_type": "application/json",
}
safety_settings = [
  {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]
try:
    gemini_model = genai.GenerativeModel(model_name="gemini-2.5-flash-lite",
                                        generation_config=generation_config,
                                        safety_settings=safety_settings)
except Exception as e:
    print(f"FATAL: Error creating Gemini model: {e}")
    # Consider how to handle this - maybe fallback or log critical error
    gemini_model = None

# --- Gemini "Brain" Function (from ai_test.py) ---
# --- Gemini "Brain" Function (MODIFIED PROMPT) ---
def get_json_from_gemini(content: str):
    if not content or not gemini_model:
        return None

    # --- THE NEW PROMPT ---
    prompt = f"""
    Analyze the following text scraped from a webpage. Your goal is to act as an AI librarian, 
    providing a detailed classification and relevant tags.

    **Instructions:**
    1. Extract the main **title** or name of the content.
    2. Write a concise 1-2 sentence **summary** focusing on the core subject.
    3. Determine the single most relevant **primary_category** from this list: 
       "Programming", "Technology", "Science", "News", "Food & Recipe", "Movies & TV", 
       "Books & Literature", "Travel & Places", "People", "Health & Fitness", 
       "Shopping & Product", "Music", "Gaming", "Finance", "Education", "Other".
    4. Generate a list of 5-10 **specific_tags** (lowercase strings) that accurately describe the content. Be specific (e.g., "python", "fastapi tutorial", "chocolate chip cookie", "sci-fi movie", "eiffel tower history").
    5. Extract relevant **key_info** as key-value pairs (e.g., author, director, brand, price, location, ingredients). Keep values concise.
    6. Your entire response MUST be a single, valid JSON object matching the schema below. Do not include any text before or after the JSON.

    **JSON Schema:**
    {{
      "title": "string",
      "summary": "string",
      "primary_category": "string (from the list above)",
      "specific_tags": ["string", "string", ...],
      "key_info": {{ 
        "relevant_detail_1": "string value",
        "relevant_detail_2": "string value"
      }}
    }}

    **Scraped Text:**
    ---
    {content}
    ---
    """
    # --- END PROMPT ---
    
    try:
        print("Sending request to Gemini for advanced tagging...")
        response = gemini_model.generate_content(prompt)
        json_response = json.loads(response.text)
        print("Successfully received and parsed advanced JSON from Gemini.")
        
        # --- Data Validation (Optional but Recommended) ---
        # Ensure the required keys exist
        if not all(k in json_response for k in ["title", "summary", "primary_category", "specific_tags"]):
             print("WARNING: Gemini response missing required keys.")
             # You could try to fill defaults or return None/raise error
             json_response.setdefault('title', 'Processing Failed')
             json_response.setdefault('summary', '')
             json_response.setdefault('primary_category', 'Other')
             json_response.setdefault('specific_tags', [])
             json_response.setdefault('key_info', {})

        # Ensure specific_tags is a list of strings
        if not isinstance(json_response.get('specific_tags'), list):
             json_response['specific_tags'] = []
             
        return json_response

    # ... (Keep existing error handling: json.JSONDecodeError, Exception) ...
    except json.JSONDecodeError as json_e:
        print(f"ERROR: Gemini response was not valid JSON: {json_e}")
        print("--- Raw Gemini Response ---")
        try: print(response.text) 
        except: print("Could not display raw Gemini response.")
        print("---------------------------")
        return None
    except Exception as e:
        print(f"ERROR: An error occurred calling Gemini API: {e}")
        try:
             print("Gemini prompt feedback:", response.prompt_feedback)
             print("Gemini finish reason:", response.candidates[0].finish_reason)
        except: pass
        return None

# --- NEW: Background Task Function ---
# --- NEW: Background Task Function (MODIFIED) ---
def process_item_async(item_id: str):
    print(f"[{datetime.utcnow()}] Starting ADVANCED background processing for item_id: {item_id}")
    processed_data = None
    smart_stack = 'Other' # Default smart_stack
    final_status = 'failed' 

    try:
        # 1. Fetch item (same as before)
        fetch_response = supabase.table('items').select('id, raw_content, content_type').eq('id', item_id).limit(1).execute()
        if not fetch_response.data: # ... (handle not found) ...
             print(f"ERROR: Item {item_id} not found.")
             return 
        item_data = fetch_response.data[0]
        
        # 2. Scrape or get text (same as before)
        scraped_text = None
        content_type = item_data.get('content_type')
        content = item_data.get('raw_content')
        if content_type == 'url' and content:
            scraped_text = get_text_from_url(content)
        elif content_type == 'text':
             scraped_text = content
        
        # 3. Call Gemini (using the updated function)
        if scraped_text:
            gemini_result = get_json_from_gemini(scraped_text)
            if gemini_result and isinstance(gemini_result, dict):
                print(f"Gemini ADVANCED processing successful for item {item_id}.")
                processed_data = gemini_result # Store the whole rich JSON
                # --- FIX: Use primary_category for smart_stack ---
                smart_stack = gemini_result.get('primary_category', 'Other') 
                final_status = 'processed'
            else:
                print(f"Gemini ADVANCED processing failed for item {item_id}.")
        else:
            print(f"No text content to send to Gemini for item {item_id}.")
            final_status = 'failed' # Mark as failed if no text

    except Exception as e:
        print(f"ERROR: Unhandled exception during background processing for {item_id}: {e}")
        final_status = 'failed'

    finally:
        # 4. Update DB (same logic, but now saves richer processed_data and uses primary_category for smart_stack)
        try:
            update_payload = {
                'status': final_status,
                'processed_data': processed_data, # Save the rich JSON
                'smart_stack': smart_stack      # Save the primary category here
            }
            update_payload = {k: v for k, v in update_payload.items() if v is not None}

            if update_payload:
                 update_response = supabase.table('items').update(update_payload).eq('id', item_id).execute()
                 print(f"[{datetime.utcnow()}] DB update for {item_id} complete. Status: {final_status}, Stack: {smart_stack}.")
            else:
                 print(f"[{datetime.utcnow()}] No updates needed for {item_id}.")
        except Exception as db_e:
            print(f"ERROR: Failed to update database for item {item_id}: {db_e}")

# --- Endpoint: Signup ---
@app.post("/v1/signup")
async def signup(user: UserAuth):
    # (Signup code remains the same as your previous version)
    try:
        response = supabase.table('users').insert({
            'email': user.email,
            'password': user.password
        }).execute()
        if response.data and len(response.data) > 0:
            return {"email": response.data[0]['email']}
        else:
            print(f"Signup Supabase Error: {response}")
            raise HTTPException(status_code=500, detail="Signup failed.")
    except HTTPException as http_exc:
         raise http_exc
    except Exception as e:
        if 'duplicate key value violates unique constraint "users_email_key"' in str(e):
            raise HTTPException(status_code=409, detail="Email already exists")
        print(f"Signup Error (Generic): {e}")
        raise HTTPException(status_code=500, detail="An unexpected error during signup.")

# --- Endpoint: Login ---
@app.post("/v1/login")
async def login(user: UserAuth):
    # (Login code remains the same as your previous version)
    try:
        data, count = supabase.table('users').select('*').eq('email', user.email).limit(1).execute()
        if not data or not data[1]:
            raise HTTPException(status_code=404, detail="Email not found")
        db_user = data[1][0]
        if db_user['password'] == user.password:
            return {"email": db_user['email']}
        else:
            raise HTTPException(status_code=401, detail="Incorrect password")
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"Login Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Endpoint: Capture Item (MODIFIED) ---
@app.post("/v1/capture")
async def capture_item(
    item: CaptureItem,
    background_tasks: BackgroundTasks, # <-- Add BackgroundTasks dependency
    user_email: str = Depends(get_current_user_email)
):
    """
    Saves item with 'pending' status and triggers background processing.
    """
    item_id = None # To store the ID of the newly created item
    try:
        # 1. Insert the item with status 'pending'
        insert_response = supabase.table('items').insert({
            'content_type': item.type,
            'raw_content': item.content,
            'status': 'pending', # <-- Always start as pending
            'user_email': user_email
        }).execute()

        if not insert_response.data or len(insert_response.data) == 0:
             print(f"Capture Supabase Error: Failed to insert item. Response: {insert_response}")
             raise HTTPException(status_code=500, detail="Failed to save item.")

        # Get the ID of the item we just created
        item_id = insert_response.data[0]['id']
        print(f"Item {item_id} captured successfully, status pending.")

        # --- FIX: Add the background task ---
        # Only process URLs and text for now
        if item.type in ['url', 'text']:
             background_tasks.add_task(process_item_async, item_id)
             print(f"Added background task for item {item_id}.")
        else:
             print(f"Skipping background processing for item type {item.type}.")
             # Optionally update status to 'skipped' or similar immediately
             supabase.table('items').update({'status': 'skipped'}).eq('id', item_id).execute()


        # Return success immediately (don't wait for background task)
        return {"status": "success", "data": insert_response.data[0]}

    except HTTPException as http_exc:
        # If we created an item but something else failed, maybe mark it as failed?
        # if item_id:
        #     try: supabase.table('items').update({'status': 'failed'}).eq('id', item_id).execute()
        #     except: pass # Best effort cleanup
        raise http_exc
    except Exception as e:
        print(f"Error capturing item {item_id if item_id else '(unknown)'}: {e}")
        # if item_id:
        #     try: supabase.table('items').update({'status': 'failed'}).eq('id', item_id).execute()
        #     except: pass # Best effort cleanup
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# --- Endpoint: Get Library ---
@app.get("/v1/library")
async def get_library(
    user_email: str = Depends(get_current_user_email)
):
    # (This endpoint remains the same, it fetches based on user_email)
    try:
        data, count = supabase.table('items') \
            .select('*') \
            .eq('user_email', user_email) \
            .order('created_at', desc=True) \
            .execute()
        return {"items": data[1]}
    except Exception as e:
        print(f"Error fetching library: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Root ---
@app.get("/")
async def root():
    return {"message": "Stash Backend API is running!"}