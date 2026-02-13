from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import (
    UserRegisterRequest, RegisterResponse, ErrorResponse, 
    UserResponse, CarResponse, AddCarRequest, DeleteCarResponse,
    UpdateCarRequest, UpdateCarResponse
)
from app.services.user import UserService

router = APIRouter()

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="ลงทะเบียนผู้ใช้และรถ",
    description="ลงทะเบียนผู้ใช้ใหม่พร้อมข้อมูลรถหลายคัน (flexible สามารถส่งหลายคันได้)",
    responses={
        201: {"description": "ลงทะเบียนสำเร็จ"},
        400: {"model": ErrorResponse, "description": "ข้อมูลไม่ถูกต้องหรือซ้ำในระบบ"},
        500: {"model": ErrorResponse, "description": "เกิดข้อผิดพลาดในระบบ"}
    }
)
async def register_user(
    request: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    API สำหรับลงทะเบียนผู้ใช้และรถ
    
    **ข้อมูลที่ต้องส่ง:**
    - line_id: LINE ID ของผู้ใช้ (required)
    - first_name: ชื่อ (required)
    - last_name: นามสกุล (required)
    - phone: เบอร์โทร (optional)
    - consent: ยอมรับการใช้ข้อมูล (required, ต้องเป็น true)
    - cars: รายการรถ (required, ต้องมีอย่างน้อย 1 คัน)
        - brand: ยี่ห้อรถ เช่น Toyota
        - model: แบบรถ เช่น Camry
        - year: ปี ค.ศ. เช่น 2017
        - license_plate: เลขทะเบียน เช่น "กย 1234 กรุงเทพมหานคร"
        - chassis_number: เลขตัวรถ เช่น "AAAAA12345A123456"
    
    **ตัวอย่าง:**
    ```json
    {
        "line_id": "U1234567890abcdef",
        "first_name": "สมชาย",
        "last_name": "ใจดี",
        "phone": "0812345678",
        "consent": true,
        "cars": [
            {
                "brand": "Toyota",
                "model": "Camry",
                "year": 2017,
                "license_plate": "กย 1234 กรุงเทพมหานคร",
                "chassis_number": "AAAAA12345A123456"
            },
            {
                "brand": "Honda",
                "model": "Civic",
                "year": 2020,
                "license_plate": "1กก 5678",
                "chassis_number": "BBBBB67890B789012"
            }
        ]
    }
    ```
    """
    try:
        # เรียกใช้ service เพื่อลงทะเบียน
        user, cars = UserService.register_user_with_cars(db, request)
        
        # สร้าง response
        return RegisterResponse(
            message="ลงทะเบียนสำเร็จ",
            user=UserResponse(
                id=user.id,
                line_id=user.line_id,
                first_name=user.first_name,
                last_name=user.last_name
            ),
            cars=[
                CarResponse(
                    chassis_number=car.chassis_number,
                    brand=car.brand,
                    model=car.model,
                    year=car.year,
                    license_plate=car.license_plate
                )
                for car in cars
            ],
            cars_count=len(cars)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในระบบ: {str(e)}"
        )


@router.get(
    "/user/{line_id}",
    summary="ดึงข้อมูลผู้ใช้และรถจาก LINE ID",
    description="ค้นหาข้อมูลผู้ใช้และรถทั้งหมดจาก LINE ID"
)
async def get_user_by_line_id(
    line_id: str,
    db: Session = Depends(get_db)
):
    """ดึงข้อมูลผู้ใช้และรถจาก LINE ID"""
    try:
        user = UserService.get_user_by_line_id(db, line_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ไม่พบผู้ใช้ที่มี LINE ID: {line_id}"
            )
        
        cars = UserService.get_user_cars(db, user.id)
        
        return RegisterResponse(
            message="ดึงข้อมูลสำเร็จ",
            user=UserResponse(
                id=user.id,
                line_id=user.line_id,
                first_name=user.first_name,
                last_name=user.last_name
            ),
            cars=[
                CarResponse(
                    chassis_number=car.chassis_number,
                    brand=car.brand,
                    model=car.model,
                    year=car.year,
                    license_plate=car.license_plate
                )
                for car in cars
            ],
            cars_count=len(cars)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในระบบ: {str(e)}"
        )


@router.post(
    "/add-cars",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="เพิ่มรถให้กับผู้ใช้",
    description="เพิ่มรถหลายคันให้กับผู้ใช้ที่มีอยู่แล้ว (ระบุ LINE ID)",
    responses={
        201: {"description": "เพิ่มรถสำเร็จ"},
        400: {"model": ErrorResponse, "description": "ข้อมูลไม่ถูกต้องหรือซ้ำในระบบ"},
        404: {"model": ErrorResponse, "description": "ไม่พบผู้ใช้"},
        500: {"model": ErrorResponse, "description": "เกิดข้อผิดพลาดในระบบ"}
    }
)
async def add_cars_to_user(
    request: AddCarRequest,
    db: Session = Depends(get_db)
):
    """
    API สำหรับเพิ่มรถให้กับผู้ใช้ที่มีอยู่แล้ว
    
    **ข้อมูลที่ต้องส่ง:**
    - line_id: LINE ID ของผู้ใช้ (required)
    - cars: รายการรถที่ต้องการเพิ่ม (required, ต้องมีอย่างน้อย 1 คัน)
        - brand: ยี่ห้อรถ เช่น Toyota
        - model: แบบรถ เช่น Camry
        - year: ปี ค.ศ. เช่น 2017
        - license_plate: เลขทะเบียน เช่น "กย 1234 กรุงเทพมหานคร"
        - chassis_number: เลขตัวรถ เช่น "AAAAA12345A123456"
    
    **ตัวอย่าง:**
    ```json
    {
        "line_id": "U1234567890abcdef",
        "cars": [
            {
                "brand": "Mazda",
                "model": "Mazda3",
                "year": 2019,
                "license_plate": "ขค 9999 ปทุมธานี",
                "chassis_number": "CCCCC11111C111111"
            }
        ]
    }
    ```
    """
    try:
        user, cars = UserService.add_cars_to_user(db, request.line_id, request.cars)
        
        return RegisterResponse(
            message=f"เพิ่มรถสำเร็จ {len(cars)} คัน",
            user=UserResponse(
                id=user.id,
                line_id=user.line_id,
                first_name=user.first_name,
                last_name=user.last_name
            ),
            cars=[
                CarResponse(
                    chassis_number=car.chassis_number,
                    brand=car.brand,
                    model=car.model,
                    year=car.year,
                    license_plate=car.license_plate
                )
                for car in cars
            ],
            cars_count=len(cars)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในระบบ: {str(e)}"
        )


@router.delete(
    "/cars/{license_plate}",
    response_model=DeleteCarResponse,
    status_code=status.HTTP_200_OK,
    summary="ลบรถ",
    description="ลบรถตามเลขทะเบียน",
    responses={
        200: {"description": "ลบรถสำเร็จ"},
        404: {"model": ErrorResponse, "description": "ไม่พบรถ"},
        500: {"model": ErrorResponse, "description": "เกิดข้อผิดพลาดในระบบ"}
    }
)
async def delete_car(
    license_plate: str,
    db: Session = Depends(get_db)
):
    """
    API สำหรับลบรถตามเลขทะเบียน
    
    **Parameter:**
    - license_plate: เลขทะเบียนที่ต้องการลบ เช่น กย 1234 กรุงเทพมหานคร
    
    **ตัวอย่างการเรียกใช้:**
    - DELETE `/api/v1/users/cars/กย 1234 กรุงเทพมหานคร`
    - หรือใช้ URL encoding: DELETE `/api/v1/users/cars/กย%201234%20กรุงเทพมหานคร`
    """
    try:
        deleted_plate = UserService.delete_car(db, license_plate)
        
        return DeleteCarResponse(
            message="ลบรถสำเร็จ",
            license_plate=deleted_plate
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในระบบ: {str(e)}"
        )


@router.put(
    "/cars/{license_plate}",
    response_model=UpdateCarResponse,
    status_code=status.HTTP_200_OK,
    summary="อัพเดทข้อมูลรถ",
    description="อัพเดทข้อมูลรถตามเลขทะเบียน (สามารถอัพเดทได้ทุกฟิลด์รวมถึงเลขตัวรถ)",
    responses={
        200: {"description": "อัพเดทข้อมูลสำเร็จ"},
        400: {"model": ErrorResponse, "description": "ข้อมูลไม่ถูกต้อง"},
        404: {"model": ErrorResponse, "description": "ไม่พบรถ"},
        500: {"model": ErrorResponse, "description": "เกิดข้อผิดพลาดในระบบ"}
    }
)
async def update_car(
    license_plate: str,
    request: UpdateCarRequest,
    db: Session = Depends(get_db)
):
    """
    API สำหรับอัพเดทข้อมูลรถ
    
    **Parameter:**
    - license_plate: เลขทะเบียนที่ต้องการอัพเดท เช่น "กย 1234 กรุงเทพมหานคร"
    
    **ข้อมูลที่สามารถอัพเดทได้ (ทุกฟิลด์เป็น optional):**
    - chassis_number: เลขตัวรถ เช่น AAAAA12345A123456
    - brand: ยี่ห้อรถ เช่น Toyota
    - model: แบบรถ เช่น Camry
    - year: ปี ค.ศ. เช่น 2017
    - license_plate: เลขทะเบียน เช่น "1กก 9999 กรุงเทพมหานคร"
    
    **ตัวอย่างการเรียกใช้:**
    - PUT `/api/v1/users/cars/กย 1234 กรุงเทพมหานคร`
    - หรือใช้ URL encoding: PUT `/api/v1/users/cars/กย%201234%20กรุงเทพมหานคร`
    
    **ตัวอย่าง Body (อัพเดทเฉพาะยี่ห้อและรุ่น):**
    ```json
    {
        "brand": "Honda",
        "model": "Accord"
    }
    ```
    
    **ตัวอย่าง Body (อัพเดททุกฟิลด์รวมถึงเลขตัวรถ):**
    ```json
    {
        "chassis_number": "NEWCHASSIS12345",
        "brand": "Honda",
        "model": "Accord",
        "year": 2021,
        "license_plate": "ขข 5555 นนทบุรี"
    }
    ```
    """
    try:
        car = UserService.update_car(db, license_plate, request)
        
        return UpdateCarResponse(
            message="อัพเดทข้อมูลรถสำเร็จ",
            car=CarResponse(
                chassis_number=car.chassis_number,
                brand=car.brand,
                model=car.model,
                year=car.year,
                license_plate=car.license_plate
            )
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในระบบ: {str(e)}"
        )
