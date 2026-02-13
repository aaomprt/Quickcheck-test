import React, { useEffect, useState } from 'react';
import liff from '@line/liff';
import { useNavigate, useLocation } from 'react-router-dom';

const API_REGISTER_URL = 'https://quickcheck-test.onrender.com/api/v1/register';
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

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const [lineId, setLineId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showConsentPopup, setShowConsentPopup] = useState(false);

    const defaultCar = { brand: '', model: '', year: '', license_plate: '', chassis_number: '' };
    const [cars, setCars] = useState([{ ...defaultCar }]);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', agreeToTerms: false });
    const [formErrors, setFormErrors] = useState({
        first_name: '',
        last_name: '',
        cars: [{ brand: '', model: '', year: '', license_plate: '' }],
    });

    useEffect(() => {
        const initAndCheck = async () => {
            try {
                await liff.init({ liffId: LIFF_ID });

                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }

                const profile = await liff.getProfile();
                setLineId(profile.userId);

                const res = await fetch(`https://quickcheck-test.onrender.com/api/v1/check_user/${profile.userId}`);
                if (res.ok) {
                    navigate('/member', { replace: true });
                    return;
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Initial error', err);
                setIsLoading(false);
            }
        };
        initAndCheck();
    }, [navigate]);

    const handleUserChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCarChange = (idx, e) => {
        const { name, value } = e.target;
        setCars(prev => prev.map((car, i) => {
            if (i !== idx) return car;
            if (name === 'model') {
                return {
                    ...car,
                    model: value,
                    year: value ? CAR_MODEL_YEAR_OPTIONS[value][0].toString() : ''
                };
            }
            return { ...car, [name]: value };
        }));
    };

    const validateForm = () => {
        let errors = {
            first_name: formData.first_name.trim() ? '' : 'กรุณากรอกชื่อ',
            last_name: formData.last_name.trim() ? '' : 'กรุณากรอกนามสกุล',
            cars: cars.map(car => ({
                brand: car.brand ? '' : 'กรุณาเลือกยี่ห้อรถ',
                model: car.model ? '' : 'กรุณาเลือกแบบรถ',
                year: car.year ? '' : 'กรุณาเลือกรุ่นปี',
                license_plate: car.license_plate.trim() ? '' : 'กรุณากรอกเลขทะเบียน',
            })),
        };

        const hasError = !!errors.first_name || !!errors.last_name ||
            errors.cars.some(car => Object.values(car).some(msg => msg !== ''));

        setFormErrors(errors);
        return !hasError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!lineId) return alert('ไม่พบข้อมูล LINE ID กรุณาลองใหม่');
        if (!formData.agreeToTerms) {
            setShowConsentPopup(true);
            return alert('กรุณากดยินยอมการใช้ข้อมูลส่วนบุคคลก่อนสมัครสมาชิก');
        }
        if (!validateForm()) return;

        const submitData = {
            line_id: lineId,
            ...formData,
            consent: formData.agreeToTerms,
            cars: cars.map(car => ({
                ...car,
                year: parseInt(car.year),
                chassis_number: car.chassis_number?.trim() || null
            }))
        };

        try {
            const response = await fetch(API_REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                alert('ลงทะเบียนสำเร็จ!');
                const origin = location.state?.from?.pathname || '/member';
                navigate(origin, { replace: true });
            } else {
                const result = await response.json();
                alert(`เกิดข้อผิดพลาด: ${result.detail || 'ไม่สามารถลงทะเบียนได้'}`);
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
    };

    if (isLoading) return <div className="p-10 text-center"><p>กำลังโหลดข้อมูล...</p></div>;

    return (
        <>
            <div className='flex items-center justify-center bg-white/60 h-20'>
                <h1 className='font-bold text-xl text-center text-balance'>QuickCheck member</h1>
            </div>

            <div className="bg-white/60 rounded-md my-2 p-4 items-center justify-center">
                <div className="flex items-center justify-center mt-7 mb-10">
                    <img src="/logo.png" alt="Logo" />
                </div>

                <div className="text-lg font-medium mb-1 p-4">
                    <h2 className="text-lg font-semibold text-center mb-6">ลงทะเบียนสมาชิก</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div className="mb-3">
                            <label htmlFor="first_name">
                                ชื่อ <span className="text-red-500 text-xs font-normal"> (ไม่ต้องระบุคำนำหน้าชื่อและอักษรพิเศษ)</span>
                            </label>
                            {formErrors.first_name && <div className="text-red-500 text-xs mb-1">{formErrors.first_name}</div>}
                            <input
                                type="text" id="first_name" name="first_name"
                                value={formData.first_name} onChange={handleUserChange}
                                placeholder="XXXXXXXXXX"
                                className="w-full p-2 border border-gray-500 rounded-full transition duration-150"
                                required
                            />
                        </div>

                        {/* Last Name Field */}
                        <div className="mb-3">
                            <label htmlFor="last_name">นามสกุล</label>
                            {formErrors.last_name && <div className="text-red-500 text-xs mb-1">{formErrors.last_name}</div>}
                            <input
                                type="text" id="last_name" name="last_name"
                                value={formData.last_name} onChange={handleUserChange}
                                placeholder="XXXXXXXXXX"
                                className="w-full p-2 border border-gray-500 rounded-full transition duration-150"
                                required
                            />
                        </div>

                        {/* Car(s) Section */}
                        {cars.map((car, idx) => (
                            <div key={idx} className="relative mt-6 pt-4 border-t border-gray-200 first:border-0 first:mt-0 first:pt-0">
                                <div className="mb-2 font-semibold text-orange-700 flex items-center justify-between">
                                    <span>รถคันที่ {idx + 1}</span>
                                    {cars.length > 1 && (
                                        <button
                                            type="button"
                                            className="text-xs text-red-500 border border-red-500 rounded-full px-2 py-0.5 ml-2 hover:bg-red-50 transition"
                                            onClick={() => setCars(prev => prev.filter((_, i) => i !== idx))}
                                        >
                                            ยกเลิกการเพิ่มรถ
                                        </button>
                                    )}
                                </div>
                                {/* Car Brand */}
                                <div className="mb-3">
                                    <label>ยี่ห้อรถ</label>
                                    {formErrors.cars[idx]?.brand && <div className="text-red-500 text-xs mb-1">{formErrors.cars[idx].brand}</div>}
                                    <select
                                        name="brand" value={car.brand} onChange={(e) => handleCarChange(idx, e)}
                                        className="w-full p-2 border border-gray-500 rounded-full focus:ring-orange-500 appearance-none"
                                    >
                                        <option value="" disabled>--- เลือกยี่ห้อรถ ---</option>
                                        <option value="Toyota">Toyota</option>
                                    </select>
                                </div>
                                {/* Model and Year */}
                                <div className="flex gap-3 mb-3">
                                    <div className="flex-1">
                                        <label>แบบรถ</label>
                                        {formErrors.cars[idx]?.model && <div className="text-red-500 text-xs mb-1">{formErrors.cars[idx].model}</div>}
                                        <select
                                            name="model" value={car.model} onChange={e => handleCarChange(idx, e)}
                                            className="w-full p-2 border border-gray-500 rounded-full appearance-none"
                                        >
                                            <option value="" disabled>--- เลือกแบบรถ ---</option>
                                            {CAR_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label>รุ่นปี ค.ศ.</label>
                                        {formErrors.cars[idx]?.year && <div className="text-red-500 text-xs mb-1">{formErrors.cars[idx].year}</div>}
                                        <select
                                            name="year" value={car.year} onChange={e => handleCarChange(idx, e)}
                                            className="w-full p-2 border border-gray-500 rounded-full appearance-none"
                                            disabled={!car.model}
                                        >
                                            <option value="" disabled>--- ปี ---</option>
                                            {car.model && CAR_MODEL_YEAR_OPTIONS[car.model].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {/* Numberplate */}
                                <div className="mb-3">
                                    <label>เลขทะเบียน</label>
                                    {formErrors.cars[idx]?.license_plate && <div className="text-red-500 text-xs mb-1">{formErrors.cars[idx].license_plate}</div>}
                                    <input
                                        type="text" name="license_plate" value={car.license_plate}
                                        onChange={e => handleCarChange(idx, e)}
                                        placeholder="กข 1234 กรุงเทพมหานคร"
                                        className="w-full p-2 border border-gray-500 rounded-full"
                                        required
                                    />
                                </div>
                                {/* Chassis Number */}
                                <div className="mb-3">
                                    <label>เลขตัวรถ <span className="text-gray-400 text-xs">(ถ้ามี)</span></label>
                                    <input
                                        type="text" name="chassis_number" value={car.chassis_number}
                                        onChange={e => handleCarChange(idx, e)}
                                        placeholder="AAAAA12345A123456"
                                        className="w-full p-2 border border-gray-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-start mb-3">
                            <button
                                type="button" onClick={() => setCars([...cars, { ...defaultCar }])}
                                className="bg-[#FF5F25]/80 text-white py-0.5 px-3 rounded-full shadow-lg text-sm"
                            >
                                <span className="font-bold">+</span> เพิ่มรถ
                            </button>
                        </div>

                        {/* Consent Checkbox */}
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox" id="agreeToTerms" name="agreeToTerms"
                                checked={formData.agreeToTerms} onChange={handleUserChange} className="hidden" required
                            />
                            <label htmlFor="agreeToTerms" className="flex items-center cursor-pointer mb-3">
                                <span
                                    className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center mr-2 bg-white"
                                    onClick={(e) => { e.preventDefault(); setShowConsentPopup(true); }}
                                >
                                    <span className={`w-2 h-2 rounded-full transition-opacity ${formData.agreeToTerms ? 'bg-orange-500' : 'opacity-0'}`} />
                                </span>
                                <span className="text-sm text-red-500" onClick={(e) => { e.preventDefault(); setShowConsentPopup(true); }}>
                                    ** อนุญาตการใช้ข้อมูลส่วนบุคคล **
                                </span>
                            </label>
                        </div>

                        {/* Consent Popup */}
                        {showConsentPopup && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                                <div className="fixed inset-0 bg-black/30" onClick={() => setShowConsentPopup(false)} />
                                <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center z-10">
                                    <p className="text-base text-gray-800 font-medium mb-4">
                                        ข้าพเจ้ายินยอมให้ QuickCheck จัดเก็บและใช้ข้อมูลชื่อบัญชี LINE เพื่อวัตถุประสงค์ในการติดต่อประสานงานและแจ้งข้อมูลข่าวสารที่เกี่ยวข้อง
                                    </p>
                                    <button
                                        className="px-6 py-2 bg-orange-500 text-white rounded-full shadow hover:bg-orange-600 transition"
                                        onClick={() => { setShowConsentPopup(false); setFormData(p => ({ ...p, agreeToTerms: true })); }}
                                    >
                                        ยินยอม
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <button type="submit" className="bg-[#FF5F25]/80 text-white py-2 px-8 rounded-full shadow-lg font-semibold active:scale-95 transition-transform">
                                สมัครสมาชิก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}