from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from supabase import create_client, Client
from decouple import config
from fastapi.middleware.cors import CORSMiddleware

# --- No more JWT, Clerk, or Passlib imports ---

# Load keys from .env file
SUPABASE_URL = config('SUPABASE_URL')
SUPABASE_KEY = config('SUPABASE_KEY')

# --- CLIENT SETUP ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()

# # --- CORS Middleware ---
# origins = [
#     "http://localhost:3000",
#     "https://stash-frontend-chi.vercel.app"
# ]

origins = ["*"]

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
    """
    Gets the user's email from the X-User-Email header.
    For the hackathon, we just trust this header.
    """
    if not x_user_email:
        raise HTTPException(status_code=401, detail="X-User-Email header missing")
    return x_user_email

# --- Endpoint: Signup ---
# --- Endpoint: Signup (FIXED) ---
@app.post("/v1/signup")
async def signup(user: UserAuth):
    """
    Creates a new user in the 'users' table.
    Handles Supabase v2 insert response correctly.
    """
    try:
        # Execute the insert operation
        response = supabase.table('users').insert({
            'email': user.email,
            'password': user.password # INSECURE: Storing plain text
        }).execute()

        # --- FIX: Check the response data correctly ---
        # The actual inserted data is in response.data
        if response.data and len(response.data) > 0:
            # Successfully inserted, return the email
            return {"email": response.data[0]['email']}
        else:
            # If response.data is empty or missing, something went wrong
            # Log the full response if possible for debugging
            print(f"Signup Supabase Error: Unexpected response structure: {response}")
            raise HTTPException(status_code=500, detail="Signup failed on database insert.")

    except HTTPException as http_exc:
         # Re-raise HTTP exceptions directly (like 409 Conflict)
         raise http_exc
    except Exception as e:
        # Check specifically for the unique constraint violation from Postgres/Supabase
        if 'duplicate key value violates unique constraint "users_email_key"' in str(e):
            raise HTTPException(status_code=409, detail="Email already exists")
        
        # Log other types of errors
        print(f"Signup Error (Generic): {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during signup.")

# --- Endpoint: Login ---
@app.post("/v1/login")
async def login(user: UserAuth):
    """
    Logs a user in by checking email and password.
    """
    try:
        data, count = supabase.table('users') \
            .select('*') \
            .eq('email', user.email) \
            .limit(1) \
            .execute()

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

# --- Endpoint: Capture Item ---
@app.post("/v1/capture")
async def capture_item(
    item: CaptureItem, 
    user_email: str = Depends(get_current_user_email) # Use the simple guard
):
    try:
        data, count = supabase.table('items').insert({
            'content_type': item.type,
            'raw_content': item.content,
            'status': 'pending',
            'user_email': user_email  # Use email as the foreign key
        }).execute()
        
        if data and len(data) > 1 and data[1]:
             return {"status": "success", "data": data[1]}
        else:
            return {"status": "success", "data": "Item captured"}
    except Exception as e:
        print(f"Error capturing item: {e}") 
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Get Library ---
@app.get("/v1/library")
async def get_library(
    user_email: str = Depends(get_current_user_email) # Use the simple guard
):
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

@app.get("/")
async def root():
    return {"message": "Stash Backend API is running!"}