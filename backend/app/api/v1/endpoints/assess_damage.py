from typing import List
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.assess_damage import AssessDamageResponse
from app.schemas.history_result import HistoryResultResponse, HistoryResultResponse

from app.services.assess_damage_service import create_assess_history
from app.services.result_service import get_history_result

router = APIRouter()

@router.post("/assess_damage", response_model=AssessDamageResponse)
def assess_damage(
    license_plate: str = Form(...),
    items: str = Form(...),                 # JSON string
    images: List[UploadFile] = File(...),   # multiple files
    db: Session = Depends(get_db),
):
    return create_assess_history(
        db=db,
        license_plate=license_plate,
        items_json=items,
        images=images,
        damage_level="Moderate",
    )
    
@router.get("/result/{history_id}", response_model=HistoryResultResponse)
def history_result(history_id: int, db: Session = Depends(get_db)):
    return get_history_result(db=db, history_id=history_id)