import os
from fastapi import FastAPI
from app.core.cors import setup_cors
from app.api.v1.router import api_router
from fastapi.staticfiles import StaticFiles

import tensorflow as tf
from backend.app.services.model_predict_service import ModelPredictService

app = FastAPI(title="QuickCheck Backend")

origins = [
    "http://localhost:5173",
    "https://quickcheck-test.vercel.app",
]

setup_cors(app, origins)
app.include_router(api_router, prefix="/api/v1")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

MODEL_PATH = 'app/core/assets/mobilenetv3l_v2.keras'

@app.on_event("startup")
def load_model():
    model = tf.keras.models.load_model(MODEL_PATH)
    app.state.model_predict = ModelPredictService(model)