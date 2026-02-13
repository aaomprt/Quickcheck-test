# QuickCheck Backend (FastAPI)

### Tech Stack
- Python (venv)
- FastAPI
- Uvicorn (dev server)
- CORS middleware (เชื่อมกับ React)

## Project Structure
```
backend/
├─ app/
│  ├─ main.py                      # จุดเริ่มต้น FastAPI app (รวม router + setup CORS)
│  ├─ api/
│  │  └─ v1/
│  │     ├─ router.py              # รวม route ทั้งหมดของ API
│  │     └─ endpoints/             # เรียกใช้การทำงาน
│  │        └─ health.py           # /api/v1/health (เช็คสถานะระบบ)
│  │        
│  ├─ schemas/                     # ไว้กำหนดรูปแบบ เพื่อ validate ค่า response และ request
│  │  
│  ├─ services/                    # Business logic
│  │  
│  ├─ core/
│  │  ├─ cors.py                   # ฟังก์ชัน setup CORS
│  │  ├─ config.py                 # config / env settings
│  │  └─ database.py               # เชื่อม database
├─ sql/                            # script SQL database (create/update table)
│  └─ 001_init.sql
├─ docker-compose.yml
├─ requirements.txt
├─ .env
└─ README.md
```

### แนวคิดการแยกชั้น (สำคัญ)
- **endpoints/** : คุมเส้นทาง API + รับ/ส่งข้อมูล
- **schemas/** : รูปแบบข้อมูล (validation) ด้วย Pydantic
- **services/** : ส่วน “ทำงานจริง” เช่น ประมวลผลรูป/เรียกโมเดล/คำนวณค่าใช้จ่าย
- **core/** : ส่วนกลางของระบบ เช่น config, CORS, DB 
>ให้ใส่ logic หนักๆ ใน services/ และให้ endpoints/ เป็นตัวเรียกใช้เท่านั้น

## Setup (ครั้งแรก)
1. เข้าโฟลเดอร์ backend
```
cd backend
```
2. เปิดใช้งาน venv

macOS/Linux:
```
source venv/bin/activate
```
Windows:
```
venv\Scripts\activate
```
3) ติดตั้ง dependencies
```
pip install -r requirements.txt
```

## Run Server
รันเซิร์ฟเวอร์แบบ auto reload:
```
uvicorn app.main:app --reload
```
เปิด Swagger UI:
- http://localhost:8000/docs

## Database (Local Dev)
- ใช้ PostgreSQL ผ่าน Docker 
>เพื่อให้ postgres เรา version ตรงกัน แต่ถ้ามันหนักเครื่องเกินไป สามารถใช้ postgres จากเครื่อง local ได้ครัชอ้วน

### start DB
```
docker compose up -d
```
- จากนั้น run docker ผ่าน docker desktop

**เชื่อม Postgres ใน VS code จะดู data ง่ายกว่า**
- Extensions : `PostgreSQL`

## API Endpoints

### Health Check
- `GET /api/v1/health`
- ใช้เช็คว่า backend ยังทำงานอยู่

ตัวอย่าง response:
```
{ "ok": true }
```

## Connect with React (Frontend)

#### React Example (fetch)
```
const formData = new FormData();
formData.append("file", file);

const res = await fetch("http://localhost:8000/api/v1/assess", {
  method: "POST",
  body: formData
});
const data = await res.json();
```

## Development Guide
### เพิ่ม API ใหม่
1. สร้างไฟล์ endpoint ใหม่ที่ `app/api/v1/endpoints/<feature>.py`
2. เพิ่ม router เข้า `app/api/v1/router.py`
3. ถ้ามี `payload/response` ให้สร้าง schema ใน `app/schemas/`
4. ทำ logic ใน `app/services/` แล้วให้ endpoint เรียกใช้

ตัวอย่าง pattern:
- `endpoints/feature.py` → เรียก `services/feature_service.py`

## Notes
ห้าม commit โฟลเดอร์ `venv/`

## migrate 
PGPASSWORD=<<pass>> psql -h localhost -p <<port>> -U <<username>> -d <<db_name>> -f sql/001_init.sql
PGPASSWORD=admin psql -h localhost -p 5428 -U admin -d quickcheck_db -f sql/002_insert_center_data.sql