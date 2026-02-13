import os
from fastapi import FastAPI
from app.core.cors import setup_cors
from app.api.v1.router import api_router
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="QuickCheck Backend")

origins = [
    "http://localhost:5173",
    "https://ชื่อ-app-ของคุณ.vercel.app",
]

setup_cors(app, origins)
app.include_router(api_router, prefix="/api/v1")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
