from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, cars, meta, admin, messages , chat

app = FastAPI(title="PakWheels Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(cars.router)
app.include_router(meta.router)
app.include_router(admin.router)
app.include_router(messages.router)
app.include_router(chat.router)


@app.get("/")
def read_root():
    return {"message": "PakWheels Clone API is running"}