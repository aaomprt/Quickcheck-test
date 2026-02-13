import json, os
from uuid import uuid4
from typing import List

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.models.car import CarModel
from app.models.part_master import PartMaster
from app.models.history import History, HistoryItem
from app.schemas.assess_damage import AssessDamageItemIn, AssessDamageResponse, HistoryItemOut

UPLOAD_ROOT = "uploads/history"

def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)

def _save_upload_file(file: UploadFile, dest_path: str) -> None:
    with open(dest_path, "wb") as f:
        f.write(file.file.read())

def create_assess_history(
    db: Session,
    license_plate: str,
    items_json: str,
    images: List[UploadFile],
    damage_level: str,
) -> AssessDamageResponse:

    # 1) parse items
    try:
        raw = json.loads(items_json)
        items = [AssessDamageItemIn(**x) for x in raw]
    except Exception:
        raise HTTPException(status_code=400, detail="รูปแบบ items ไม่ถูกต้อง (ต้องเป็น JSON array)")

    if len(items) == 0:
        raise HTTPException(status_code=400, detail="items ต้องมีอย่างน้อย 1 รายการ")

    # 2) validate images count
    if len(images) != len(items):
        raise HTTPException(
            status_code=400,
            detail=f"จำนวน images ({len(images)}) ต้องเท่ากับจำนวน items ({len(items)})",
        )

    # 3) find car
    car = db.get(CarModel, license_plate)
    if not car:
        raise HTTPException(status_code=404, detail="ไม่พบรถ (license_plate) ในระบบ")

    # 4) create history
    history = History(license_plate=license_plate)
    db.add(history)
    db.flush()  # เพื่อให้ได้ history.id

    # 5) prepare upload folder per history
    folder = os.path.join(UPLOAD_ROOT, str(history.id))
    _ensure_dir(folder)

    out_items: list[HistoryItemOut] = []

    # 6) create history_items + save files
    for idx, (it, img) in enumerate(zip(items, images), start=1):

        # หา part_number จาก part_master โดยอิง part_type + model (+ year ถ้ามี)
        q = (
            db.query(PartMaster)
            .filter(PartMaster.part_type == it.part_type)
            .filter(PartMaster.model == (car.model or PartMaster.model))
        )

        # ถ้ามี year ของรถ ให้พยายาม match year ก่อน
        part = None
        if car.year is not None:
            part = (
                db.query(PartMaster)
                .filter(PartMaster.part_type == it.part_type)
                .filter(PartMaster.model == (car.model or PartMaster.model))
                .filter((PartMaster.year == car.year) | (PartMaster.year.is_(None)))
                .first()
            )
        else:
            part = q.first()

        if not part:
            raise HTTPException(
                status_code=404,
                detail=f"ไม่พบอะไหล่ใน part_master สำหรับ part_type='{it.part_type}' (model/year ของรถไม่ตรง)",
            )

        # บันทึกไฟล์
        ext = os.path.splitext(img.filename or "")[1] or ".jpg"
        fname = f"{idx:02d}_{uuid4().hex}{ext}"
        dest = os.path.join(folder, fname)
        _save_upload_file(img, dest)

        rel_path = dest.replace("\\", "/")  # ให้ path เป็นแบบเดียวกัน

        hi = HistoryItem(
            history_id=history.id,
            part_number=part.part_number,
            damage_level=damage_level,
            image_path=rel_path,
        )
        db.add(hi)

        out_items.append(
            HistoryItemOut(
                part_number=part.part_number,
                part_type=part.part_type,
                damage_level=damage_level,
                image_path=rel_path,
            )
        )

    db.commit()

    return AssessDamageResponse(
        history_id=history.id,
        license_plate=license_plate,
        items=out_items,
    )
