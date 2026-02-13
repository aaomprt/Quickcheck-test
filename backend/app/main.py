from fastapi import FastAPI
from app.core.cors import setup_cors
from app.api.v1.router import api_router
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="QuickCheck Backend")

setup_cors(app, ["http://localhost:5173"])
app.include_router(api_router, prefix="/api/v1")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
