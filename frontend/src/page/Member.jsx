import React, { useState, useEffect, useCallback } from "react";
import { mockFormData, mockCars } from "../assets/MemberData";
import liff from "@line/liff";

const API_BASE_URL = 'https://quickcheck-test.onrender.com/api/v1';
const LIFF_ID = '2008188161-uQLSDa4M';

const CAR_MODEL_YEAR_OPTIONS = {
    'Camry': [2017, 2018, 2019, 2020, 2021, 2022, 2023],
    'Corolla cross': [2022, 2023],
    'Yaris ativ': [2018, 2019],
    'Yaris sedan': [2019],
    'Yaris hatchback': [2017, 2020],
    'Altis': [2019, 2020, 2021, 2022],
};

const CAR_MODELS = Object.keys(CAR_MODEL_YEAR_OPTIONS);

// ดึงรูป Model ของรถ
const getModelImage = (model) => {
    if (!model) return '';
    const images = {
        'Camry': '/model/Camry.png',
        'Corolla cross': '/model/Corolla cross.png',
        'Yaris ativ': '/model/Yaris ativ.png',
        'Yaris sedan': '/model/Yaris sedan.png',
        'Yaris hatchback': '/model/Yaris hatchback.png',
        'Altis': '/model/Altis.png'
    };
    return images[model] || '';
};

function CarAccordion({ car, idx, onEditCar, onDeleteCar }) {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editCar, setEditCar] = useState({ ...car });
    const [editErrors, setEditErrors] = useState({ brand: '', model: '', year: '', license_plate: '', chassis_number: '' });

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditCar(prev => ({ ...prev, [name]: value }));
    };

    const handleEditCarChange = (e) => {
        const { name, value } = e.target;
        if (name === 'brand') setEditCar(prev => ({ ...prev, brand: value }));
        else if (name === 'model') {
            if (!value) setEditCar(prev => ({ ...prev, model: '', year: '' }));
            else {
                const years = CAR_MODEL_YEAR_OPTIONS[value];
                setEditCar(prev => ({ ...prev, model: value, year: years[0].toString() }));
            }
        }
        else if (name === 'year') setEditCar(prev => ({ ...prev, year: value }));
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        let errors = { brand: '', model: '', year: '', license_plate: '', chassis_number: '' };
        let hasError = false;
        if (!editCar.brand?.trim()) { errors.brand = 'กรุณาเลือกยี่ห้อรถ'; hasError = true; }
        if (!editCar.model?.trim()) { errors.model = 'กรุณาเลือกแบบรถ'; hasError = true; }
        if (!editCar.year?.toString().trim()) { errors.year = 'กรุณาเลือกรุ่นปี'; hasError = true; }
        if (!editCar.license_plate?.trim()) { errors.license_plate = 'กรุณากรอกเลขทะเบียน'; hasError = true; }
        if (editCar.chassis_number?.trim() && editCar.chassis_number.trim().length !== 17) {
            errors.chassis_number = 'เลขตัวรถต้องมี 17 ตัวอักษร';
            hasError = true;
        }
        setEditErrors(errors);
        if (hasError) return;
        onEditCar(idx, editCar);
        setEditMode(false);
    };

    return (
        <div className="mb-4 border rounded-lg bg-white/80 shadow">
            <button type="button" className="w-full flex items-center justify-between px-4 py-3" onClick={() => setOpen(!open)}>
                <span className="font-semibold text-base text-left">{car.brand} {car.model} {car.license_plate}</span>
                <span className="flex items-center gap-2">
                    <img src="/edit_car.png" alt="edit" className="w-5 h-5 cursor-pointer hover:scale-110" 
                         onClick={(e) => { e.stopPropagation(); setEditMode(true); setOpen(true); }} />
                    <span className="text-gray-500">{open ? "▲" : "▼"}</span>
                </span>
            </button>
            {open && (
                <div className="px-4 pb-5">
                    {editMode ? (
                        <form onSubmit={handleSaveEdit} className="mb-2">
                            <div className="flex justify-center mb-3">
                                {editCar.carImage && <img src={editCar.carImage} alt="preview" className="w-48 h-28 object-contain mb-5" />}
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-sm font-medium mb-4">
                                <div className="text-gray-600 col-span-1">เลขทะเบียน</div>
                                <div className="col-span-1">
                                    <input type="text" name="license_plate" value={editCar.license_plate} readOnly className="border rounded p-1 w-full bg-gray-50" />
                                </div>
                                <div className="text-gray-600 col-span-1">ยี่ห้อรถ</div>
                                <div className="col-span-1">
                                    <select name="brand" value={editCar.brand} onChange={handleEditCarChange} className="border rounded p-1 w-full">
                                        <option value="Toyota">Toyota</option>
                                    </select>
                                </div>
                                <div className="text-gray-600 col-span-1">แบบรถ</div>
                                <div className="col-span-1">
                                    <select name="model" value={editCar.model} onChange={handleEditCarChange} className="border rounded p-1 w-full">
                                        {CAR_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="text-gray-600 col-span-1">รุ่นปี ค.ศ.</div>
                                <div className="col-span-1">
                                    <select name="year" value={editCar.year} onChange={handleEditCarChange} className="border rounded p-1 w-full">
                                        {editCar.model && CAR_MODEL_YEAR_OPTIONS[editCar.model].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="text-gray-600 col-span-1">เลขตัวรถ</div>
                                <div className="col-span-1">
                                    <input type="text" name="chassis_number" value={editCar.chassis_number} onChange={handleEditInputChange} className="border rounded p-1 w-full" />
                                    {editErrors.chassis_number && <div className="text-red-500 text-xs mt-1">{editErrors.chassis_number}</div>}
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => onDeleteCar(idx)} className="bg-red-500 text-white py-1 px-4 rounded-full">ลบข้อมูล</button>
                                <button type="submit" className="bg-[#FF5F25]/80 text-white py-0.5 px-3 rounded-full drop-shadow-lg">บันทึก</button>
                                <button type="button" onClick={() => setEditMode(false)} className="bg-gray-300 text-gray-700 py-1 px-4 rounded-full">ยกเลิก</button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm font-medium">
                            <div className="col-span-2 flex justify-center">{car.carImage && <img src={car.carImage} className="w-48 h-28 object-contain mb-5" alt="car" />}</div>
                            <div className="text-gray-600">เลขทะเบียน</div><div>{car.license_plate}</div>
                            <div className="text-gray-600">ยี่ห้อรถ</div><div>{car.brand}</div>
                            <div className="text-gray-600">แบบรถ</div><div>{car.model}</div>
                            <div className="text-gray-600">รุ่นปี ค.ศ.</div><div>{car.year}</div>
                            <div className="text-gray-600">เลขตัวรถ</div><div>{car.chassis_number || '-'}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Member() {
    const [lineId, setLineId] = useState('');
    const [displayFormData, setDisplayFormData] = useState({ firstName: '', lastName: '' });
    const [displayCars, setDisplayCars] = useState([]);
    const [showAddCarForm, setShowAddCarForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newCar, setNewCar] = useState({ brand: "Toyota", model: "", year: "", license_plate: "", chassis_number: "", carImage: "" });

    // ดึงข้อมูล
    const fetchUserData = useCallback(async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setDisplayFormData({ firstName: data.user.first_name, lastName: data.user.last_name });
                setDisplayCars(data.cars.map(car => ({
                    ...car,
                    year: car.year.toString(),
                    carImage: getModelImage(car.model)
                })));
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setDisplayFormData(mockFormData);
            setDisplayCars(mockCars.map(car => ({
                brand: car.carBrand, model: car.carModel, year: car.carYear,
                license_plate: car.carNumberplate, chassis_number: car.carChassisNumber,
                carImage: getModelImage(car.carModel)
            })));
        } finally {
            setLoading(false);
        }
    }, []);

    // ดึงข้อมูลผู้ใช้จาก LIFF
    useEffect(() => {
        const initLiff = async () => {
            try {
                await liff.init({ liffId: LIFF_ID });
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setLineId(profile.userId);
                    fetchUserData(profile.userId);
                } else {
                    liff.login();
                }
            } catch (err) {
                console.error("LIFF Init Error:", err);
                setLoading(false);
            }
        };
        initLiff();
    }, [fetchUserData]);

    const handleNewCarChange = (e) => {
        const { name, value } = e.target;
        if (name === 'model') {
            const years = CAR_MODEL_YEAR_OPTIONS[value];
            setNewCar(prev => ({ ...prev, model: value, year: years[0].toString() }));
        } else {
            setNewCar(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddCar = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/add-cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    line_id: lineId,
                    cars: [{ ...newCar, year: parseInt(newCar.year), chassis_number: newCar.chassis_number.trim() || null }]
                })
            });
            if (response.ok) {
                alert('เพิ่มรถสำเร็จ!');
                fetchUserData(lineId);
                setShowAddCarForm(false);
                setNewCar({ brand: "Toyota", model: "", year: "", license_plate: "", chassis_number: "", carImage: "" });
            } else {
                const error = await response.json();
                alert(`เกิดข้อผิดพลาด: ${error.detail}`);
            }
        } catch (error) { alert('การเชื่อมต่อล้มเหลว'); }
    };

    const handleEditCar = async (idx, updatedCar) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cars/${encodeURIComponent(displayCars[idx].license_plate)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updatedCar, year: parseInt(updatedCar.year) })
            });
            if (response.ok) { fetchUserData(lineId); alert('บันทึกเรียบร้อย'); }
        } catch (error) { console.error(error); }
    };

    const handleDeleteCar = async (idx) => {
        if (!window.confirm("ยืนยันการลบ?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/cars/${encodeURIComponent(displayCars[idx].license_plate)}`, {
                method: 'DELETE'
            });
            if (response.ok) fetchUserData(lineId);
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-lg font-medium">กำลังโหลดข้อมูล...</p></div>;

    return (
        <div className="items-center justify-center">
            {/* Header & Logo */}
            <div className='flex items-center justify-center bg-white/60 h-20'><h1 className='font-bold text-xl'>QuickCheck member</h1></div>
            <div className="bg-white/60 rounded-md my-2 p-4 items-center justify-center">
                <div className="flex items-center justify-center mt-7 mb-10"><img src="/logo.png" alt="Logo" /></div>
                
                {/* User Info */}
                <div className="text-lg font-medium rounded-lg mb-1 p-4">
                    <h2 className="text-lg font-semibold text-center mb-4">ข้อมูลส่วนตัว</h2>
                    <div className="space-y-3">
                        <div><label className="text-gray-700 text-sm">ชื่อ</label>
                        <input value={displayFormData.firstName} readOnly className="w-full p-2 border border-gray-500 rounded-full bg-gray-100" /></div>
                        <div><label className="text-gray-700 text-sm">นามสกุล</label>
                        <input value={displayFormData.lastName} readOnly className="w-full p-2 border border-gray-500 rounded-full bg-gray-100" /></div>
                    </div>
                </div>
            </div>

            {/* Car List */}
            <div className="text-lg font-medium bg-white/60 rounded-md my-2 p-4">
                <h3 className="text-lg font-semibold text-center mb-7">รายการรถยนต์</h3>
                {displayCars.map((car, idx) => (
                    <CarAccordion key={car.license_plate + idx} car={car} idx={idx} onEditCar={handleEditCar} onDeleteCar={handleDeleteCar} />
                ))}

                {showAddCarForm ? (
                    <form className="mb-4 border rounded-lg bg-white/80 shadow p-4" onSubmit={handleAddCar}>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm font-medium mb-4">
                            <div className="text-gray-600">เลขทะเบียน</div>
                            <input name="license_plate" value={newCar.license_plate} onChange={(e) => setNewCar({...newCar, license_plate: e.target.value})} className="border rounded p-1" placeholder="กข 1234" required />
                            
                            <div className="text-gray-600">แบบรถ</div>
                            <select name="model" value={newCar.model} onChange={handleNewCarChange} className="border rounded p-1" required>
                                <option value="" disabled>เลือกแบบรถ</option>
                                {CAR_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>

                            <div className="text-gray-600">รุ่นปี ค.ศ.</div>
                            <select name="year" value={newCar.year} onChange={handleNewCarChange} className="border rounded p-1" disabled={!newCar.model} required>
                                <option value="" disabled>ปี</option>
                                {newCar.model && CAR_MODEL_YEAR_OPTIONS[newCar.model].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            <div className="text-gray-600">เลขตัวรถ</div>
                            <input name="chassis_number" value={newCar.chassis_number} onChange={(e) => setNewCar({...newCar, chassis_number: e.target.value})} className="border rounded p-1" placeholder="17 หลัก" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="submit" className="bg-[#FF5F25]/80 text-white py-1 px-4 rounded-full">บันทึก</button>
                            <button type="button" onClick={() => setShowAddCarForm(false)} className="bg-gray-300 py-1 px-4 rounded-full">ยกเลิก</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setShowAddCarForm(true)} className="bg-[#FF5F25]/80 text-white py-1 px-4 rounded-full shadow-lg">+ เพิ่มรถ</button>
                )}
            </div>
        </div>
    );
}