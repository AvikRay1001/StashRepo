from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from decouple import config # To read .env
from fastapi.middleware.cors import CORSMiddleware # For CORS

# Load keys from .env file
SUPABASE_URL = config('SUPABASE_URL')
SUPABASE_KEY = config('SUPABASE_KEY')

# Check if keys are loaded
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# --- Add CORS Middleware ---
# This allows your Next.js app (running on a different port/domain)
# to make requests to this FastAPI server.
origins = [
    "http://localhost:3000",
    "https://stash-frontend-chi.vercel.app/"  # Your Next.js local dev URL
    # Add your deployed frontend URL here later
    # e.g., "https://your-frontend-app.vercel.app" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)
# ---------------------------

class CaptureItem(BaseModel):
    type: str    # e.g., "url"
    content: str # e.g., "https://example.com"

@app.post("/v1/capture")
async def capture_item(item: CaptureItem):
    """
    Receives an item from the PWA and saves it to the database.
    """
    try:
        data, count = supabase.table('items').insert({
            'content_type': item.type,
            'raw_content': item.content,
            'status': 'pending'
        }).execute()

        # Check for API-level errors from Supabase
        if data and len(data) > 1 and data[1]:
             return {"status": "success", "data": data[1]}
        else:
            # Handle cases where insert might not return data as expected
            return {"status": "success", "data": "Item captured"}

    except Exception as e:
        print(f"Error capturing item: {e}") # Log error to server
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/library")
async def get_library():
    """
    Retrieves all items from the database to display in the UI.
    """
    try:
        # Select all columns, order by creation date (newest first)
        data, count = supabase.table('items').select('*').order('created_at', desc=True).execute()

        # data[1] contains the list of items
        return {"items": data[1]} 
    except Exception as e:
        print(f"Error fetching library: {e}") # Log error to server
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Stash Backend API is running!"}