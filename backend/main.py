# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from supabase import create_client, Client
# from decouple import config # To read .env
# from fastapi.middleware.cors import CORSMiddleware # For CORS

# from clerk_sdk import Clerk
# from clerk_sdk.jwt import JWT

# # Load keys from .env file
# SUPABASE_URL = config('SUPABASE_URL')
# SUPABASE_KEY = config('SUPABASE_KEY')

# # Check if keys are loaded
# if not SUPABASE_URL or not SUPABASE_KEY:
#     raise ValueError("Supabase URL and Key must be set in .env file")

# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# clerk_secret = config('CLERK_SECRET_KEY')
# clerk = Clerk(secret_key=clerk_secret)
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# app = FastAPI()

# # --- Add CORS Middleware ---
# # This allows your Next.js app (running on a different port/domain)
# # to make requests to this FastAPI server.
# origins = [
#     "http://localhost:3000",
#     "https://stash-frontend-chi.vercel.app"  # Your Next.js local dev URL
#     # Add your deployed frontend URL here later
#     # e.g., "https://your-frontend-app.vercel.app" 
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"], # Allows all methods (GET, POST, etc.)
#     allow_headers=["*"], # Allows all headers
# )
# # ---------------------------

# class CaptureItem(BaseModel):
#     type: str    # e.g., "url"
#     content: str # e.g., "https://example.com"

# @app.post("/v1/capture")
# async def capture_item(item: CaptureItem):
#     """
#     Receives an item from the PWA and saves it to the database.
#     """
#     try:
#         data, count = supabase.table('items').insert({
#             'content_type': item.type,
#             'raw_content': item.content,
#             'status': 'pending'
#         }).execute()

#         # Check for API-level errors from Supabase
#         if data and len(data) > 1 and data[1]:
#              return {"status": "success", "data": data[1]}
#         else:
#             # Handle cases where insert might not return data as expected
#             return {"status": "success", "data": "Item captured"}

#     except Exception as e:
#         print(f"Error capturing item: {e}") # Log error to server
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/v1/library")
# async def get_library():
#     """
#     Retrieves all items from the database to display in the UI.
#     """
#     try:
#         # Select all columns, order by creation date (newest first)
#         data, count = supabase.table('items').select('*').order('created_at', desc=True).execute()

#         # data[1] contains the list of items
#         return {"items": data[1]} 
#     except Exception as e:
#         print(f"Error fetching library: {e}") # Log error to server
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/")
# async def root():
#     return {"message": "Stash Backend API is running!"}








from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
from decouple import config # To read .env
from fastapi.middleware.cors import CORSMiddleware # For CORS
from fastapi.security import OAuth2PasswordBearer

# --- NEW CLERK IMPORTS ---
from clerk_backend_api import Clerk

# -------------------------

# Load keys from .env file
SUPABASE_URL = config('SUPABASE_URL')
SUPABASE_KEY = config('SUPABASE_KEY')
CLERK_SECRET_KEY = config('CLERK_SECRET_KEY') # Make sure this is in your .env

# Check if keys are loaded
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in .env file")
if not CLERK_SECRET_KEY:
    raise ValueError("CLERK_SECRET_KEY must be set in .env file")

# --- CLIENT SETUPS ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
clerk = Clerk(CLERK_SECRET_KEY)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# ---------------------

app = FastAPI()

# --- Add CORS Middleware ---
origins = [
    "http://localhost:3000",             # Your Next.js local dev URL
    "https://stash-frontend-chi.vercel.app"  # Your deployed Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)
# ---------------------------

# --- NEW AUTH DEPENDENCY ---
# This function will be our "guard".
# It runs before any endpoint that requires it.
async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """
    Validates the Clerk JWT and returns the user ID (sub).
    This function is used as a dependency in protected endpoints.
    """
    try:
        # Verify the token
        jwt = clerk.decode_jwt(token)
        
        # Check if it's active
        if jwt.status != "active":
            raise HTTPException(status_code=401, detail="Invalid token status")
        
        # Return the user ID (from Clerk, looks like 'user_...')
        return jwt.claims['sub'] 
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
# ---------------------------

class CaptureItem(BaseModel):
    type: str    # e.g., "url"
    content: str # e.g., "https://example.com"

@app.post("/v1/capture")
async def capture_item(
    item: CaptureItem, 
    user_id: str = Depends(get_current_user_id) # <-- PROTECTED
):
    """
    Receives an item from the PWA and saves it to the database
    linked to the authenticated user.
    """
    try:
        data, count = supabase.table('items').insert({
            'content_type': item.type,
            'raw_content': item.content,
            'status': 'pending',
            'user_id': user_id  # <-- ADD USER ID TO THE ROW
        }).execute()

        # Check for API-level errors from Supabase
        if data and len(data) > 1 and data[1]:
             return {"status": "success", "data": data[1]}
        else:
            return {"status": "success", "data": "Item captured"}

    except Exception as e:
        print(f"Error capturing item: {e}") # Log error to server
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/library")
async def get_library(
    user_id: str = Depends(get_current_user_id) # <-- PROTECTED
):
    """
    Retrieves all items from the database that belong
    to the authenticated user.
    """
    try:
        # Select all columns, order by creation date (newest first)
        # ONLY where the user_id matches the authenticated user.
        data, count = supabase.table('items') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .execute()
        
        # data[1] contains the list of items
        return {"items": data[1]} 
    except Exception as e:
        print(f"Error fetching library: {e}") # Log error to server
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Stash Backend API is running!"}