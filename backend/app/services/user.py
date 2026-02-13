from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from app.models.user import UserModel
from app.models.car import CarModel
from app.schemas.user import UserRegisterRequest, CarCreate, UpdateCarRequest

class UserService:
    @staticmethod
    def register_user_with_cars(db: Session, request: UserRegisterRequest) -> tuple[UserModel, List[CarModel]]:
        """
        ลงทะเบียนผู้ใช้พร้อมรถหลายคัน
        
        Args:
            db: Database session
            request: ข้อมูล user และรถที่ต้องการลงทะเบียน
            
        Returns:
            tuple ของ (UserModel, List[CarModel])
            
        Raises:
            ValueError: เมื่อ line_id ซ้ำหรือเลขตัวรถซ้ำ
        """
        try:
            # ตรวจสอบว่า line_id มีอยู่แล้วหรือไม่
            existing_user = db.query(UserModel).filter(UserModel.line_id == request.line_id).first()
            if existing_user:
                raise ValueError(f"LINE ID {request.line_id} มีในระบบแล้ว")
            
            # ตรวจสอบว่าเลขตัวรถซ้ำหรือไม่ (เฉพาะที่มีค่า)
            chassis_numbers = [car.chassis_number for car in request.cars if car.chassis_number]
            if chassis_numbers:
                existing_cars = db.query(CarModel).filter(CarModel.chassis_number.in_(chassis_numbers)).all()
                if existing_cars:
                    duplicate_chassis = [car.chassis_number for car in existing_cars]
                    raise ValueError(f"เลขตัวรถซ้ำในระบบ: {', '.join(duplicate_chassis)}")
            
            # สร้าง User
            new_user = UserModel(
                line_id=request.line_id,
                first_name=request.first_name,
                last_name=request.last_name
            )
            db.add(new_user)
            db.flush()  # เพื่อให้ได้ user.id
            
            # สร้างรถหลายคัน
            new_cars = []
            for car_data in request.cars:
                new_car = CarModel(
                    chassis_number=car_data.chassis_number,
                    user_id=new_user.id,
                    brand=car_data.brand,
                    model=car_data.model,
                    year=car_data.year,
                    license_plate=car_data.license_plate
                )
                db.add(new_car)
                new_cars.append(new_car)
            
            # Commit transaction
            db.commit()
            db.refresh(new_user)
            for car in new_cars:
                db.refresh(car)
            
            return new_user, new_cars
            
        except IntegrityError as e:
            db.rollback()
            raise ValueError(f"ข้อมูลซ้ำในระบบ: {str(e)}")
        except Exception as e:
            db.rollback()
            raise e
    
    @staticmethod
    def get_user_by_line_id(db: Session, line_id: str) -> UserModel | None:
        """ค้นหา user จาก LINE ID"""
        return db.query(UserModel).filter(UserModel.line_id == line_id).first()
    
    @staticmethod
    def get_user_cars(db: Session, user_id: int) -> List[CarModel]:
        """ดึงรถทั้งหมดของ user"""
        return db.query(CarModel).filter(CarModel.user_id == user_id).all()
    
    @staticmethod
    def add_cars_to_user(db: Session, line_id: str, cars: List[CarCreate]) -> tuple[UserModel, List[CarModel]]:
        """
        เพิ่มรถให้กับ user ที่มีอยู่แล้ว
        
        Args:
            db: Database session
            line_id: LINE ID ของ user
            cars: รายการรถที่ต้องการเพิ่ม
            
        Returns:
            tuple ของ (UserModel, List[CarModel])
            
        Raises:
            ValueError: เมื่อไม่พบ user หรือเลขตัวรถซ้ำ
        """
        try:
            # ตรวจสอบว่า user มีอยู่จริง
            user = db.query(UserModel).filter(UserModel.line_id == line_id).first()
            if not user:
                raise ValueError(f"ไม่พบผู้ใช้ที่มี LINE ID: {line_id}")
            
            # ตรวจสอบว่าเลขตัวรถซ้ำหรือไม่ (เฉพาะที่มีค่า)
            chassis_numbers = [car.chassis_number for car in cars if car.chassis_number]
            if chassis_numbers:
                existing_cars = db.query(CarModel).filter(CarModel.chassis_number.in_(chassis_numbers)).all()
                if existing_cars:
                    duplicate_chassis = [car.chassis_number for car in existing_cars]
                    raise ValueError(f"เลขตัวรถซ้ำในระบบ: {', '.join(duplicate_chassis)}")
            
            # สร้างรถหลายคัน
            new_cars = []
            for car_data in cars:
                new_car = CarModel(
                    chassis_number=car_data.chassis_number,
                    user_id=user.id,
                    brand=car_data.brand,
                    model=car_data.model,
                    year=car_data.year,
                    license_plate=car_data.license_plate
                )
                db.add(new_car)
                new_cars.append(new_car)
            
            # Commit transaction
            db.commit()
            for car in new_cars:
                db.refresh(car)
            
            return user, new_cars
            
        except IntegrityError as e:
            db.rollback()
            raise ValueError(f"ข้อมูลซ้ำในระบบ: {str(e)}")
        except Exception as e:
            db.rollback()
            raise e
    
    @staticmethod
    def delete_car(db: Session, license_plate: str) -> str:
        """
        ลบรถตามเลขทะเบียน
        
        Args:
            db: Database session
            license_plate: เลขทะเบียนที่ต้องการลบ
            
        Returns:
            เลขทะเบียนที่ถูกลบ
            
        Raises:
            ValueError: เมื่อไม่พบรถที่ต้องการลบ
        """
        try:
            car = db.query(CarModel).filter(CarModel.license_plate == license_plate).first()
            if not car:
                raise ValueError(f"ไม่พบรถที่มีเลขทะเบียน: {license_plate}")
            
            db.delete(car)
            db.commit()
            return license_plate
            
        except Exception as e:
            db.rollback()
            raise e
    
    @staticmethod
    def update_car(db: Session, license_plate: str, update_data: UpdateCarRequest) -> CarModel:
        """
        อัพเดทข้อมูลรถ
        
        Args:
            db: Database session
            license_plate: เลขทะเบียนที่ต้องการอัพเดท
            update_data: ข้อมูลที่ต้องการอัพเดท
            
        Returns:
            CarModel ที่ถูกอัพเดท
            
        Raises:
            ValueError: เมื่อไม่พบรถที่ต้องการอัพเดท หรือเลขตัวรถ/ทะเบียนซ้ำ
        """
        try:
            car = db.query(CarModel).filter(CarModel.license_plate == license_plate).first()
            if not car:
                raise ValueError(f"ไม่พบรถที่มีเลขทะเบียน: {license_plate}")
            
            # ถ้ามีการเปลี่ยน chassis_number ต้องตรวจสอบว่าซ้ำหรือไม่
            if update_data.chassis_number is not None:
                new_chassis = update_data.chassis_number.upper()
                # ตรวจสอบว่าเลขตัวรถใหม่ซ้ำกับรถอื่นหรือไม่
                existing_car = db.query(CarModel).filter(
                    CarModel.chassis_number == new_chassis,
                    CarModel.license_plate != license_plate
                ).first()
                if existing_car:
                    raise ValueError(f"เลขตัวรถ {new_chassis} มีในระบบแล้ว")
                
                car.chassis_number = new_chassis
            
            # ถ้ามีการเปลี่ยน license_plate (ซึ่งเป็น PK) ต้องตรวจสอบว่าซ้ำหรือไม่
            if update_data.license_plate is not None and update_data.license_plate != license_plate:
                # ตรวจสอบว่าทะเบียนใหม่มีอยู่แล้วหรือไม่
                existing_plate = db.query(CarModel).filter(CarModel.license_plate == update_data.license_plate).first()
                if existing_plate:
                    raise ValueError(f"เลขทะเบียน {update_data.license_plate} มีในระบบแล้ว")
                # ต้องลบและสร้างใหม่เพราะ PK เปลี่ยนไม่ได้
                # ต้องลบ record เก่าแล้วสร้างใหม่
                db.delete(car)
                db.flush()
                
                new_car = CarModel(
                    license_plate=update_data.license_plate,
                    chassis_number=car.chassis_number if update_data.chassis_number is None else new_chassis,
                    user_id=car.user_id,
                    brand=update_data.brand if update_data.brand is not None else car.brand,
                    model=update_data.model if update_data.model is not None else car.model,
                    year=update_data.year if update_data.year is not None else car.year,
                    model_image=car.model_image,
                    service_center_id=car.service_center_id
                )
                db.add(new_car)
                db.commit()
                db.refresh(new_car)
                return new_car
            
            # อัพเดทฟิลด์อื่นๆ (ไม่รวม license_plate)
            if update_data.brand is not None:
                car.brand = update_data.brand
            if update_data.model is not None:
                car.model = update_data.model
            if update_data.year is not None:
                car.year = update_data.year
            
            db.commit()
            db.refresh(car)
            return car
            
        except IntegrityError as e:
            db.rollback()
            raise ValueError(f"ไม่สามารถอัพเดทข้อมูลได้: {str(e)}")
        except Exception as e:
            db.rollback()
            raise e
