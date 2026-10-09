import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

from app.routers import auth, cars, meta, admin, messages, chat

SITE_NAME = os.getenv("SITE_NAME", "GaadiLife")

app = FastAPI(title=f"{SITE_NAME} API")

# FRONTEND_URL mein ek ya zyada website addresses likh sakte hain (comma se alag).
# Aakhir mein "/" nahi lagana. Na likha ho to laptop wala address chalta hai.
origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Server par nayi copy mein uploads folder na ho to khud ban jaye
os.makedirs("app/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(cars.router)
app.include_router(meta.router)
app.include_router(admin.router)
app.include_router(messages.router)
app.include_router(chat.router)


@app.get("/")
def read_root():
    return {"message": f"{SITE_NAME} API is running"}