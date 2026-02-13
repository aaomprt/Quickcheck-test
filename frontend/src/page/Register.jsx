import React, { useState } from 'react';

const CAR_MODEL_YEAR_OPTIONS = {
    'Camry': [2017, 2018, 2019, 2020, 2021, 2022, 2023],
    'Corolla cross': [2022, 2023],
    'Yaris ativ': [2018, 2019],
    'Yaris sedan': [2019],
    'Yaris hatchback': [2017,2020],
    'Altis': [2019, 2020, 2021, 2022],
};

const CAR_MODELS = Object.keys(CAR_MODEL_YEAR_OPTIONS);



export default function Register() {
    const defaultCar = {
        brand: '',
        model: '',
        year: '',
        license_plate: '',
        chassis_number: '',
    };
    const [cars, setCars] = useState([{ ...defaultCar }]);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        agreeToTerms: false,
    });
    const [showConsentPopup, setShowConsentPopup] = useState(false);
    const [formErrors, setFormErrors] = useState({
        first_name: '',
        last_name: '',
        cars: [{ brand: '', model: '', year: '', license_plate: '' }],
    });

    // ป้องกันการเปลี่ยนแปลง checkbox โดยตรง
    const handleConsentCheckbox = (e) => {
        e.preventDefault();
        setShowConsentPopup(true);
    };

    // handle change for user info
    const handleUserChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // handle change for car info
    const handleCarChange = (idx, e) => {
        const { name, value } = e.target;
        setCars(prevCars => prevCars.map((car, i) => {
            if (i !== idx) return car;
            if (name === 'model') {
                // If user selects the placeholder, reset year
                if (!value) {
                    return {
                        ...car,
                        model: '',
                        year: '',
                    };
                }
                const years = CAR_MODEL_YEAR_OPTIONS[value];
                return {
                    ...car,
                    model: value,
                    year: years[0].toString(),
                };
            }
            if (name === 'year' && !value) {
                return {
                    ...car,
                    year: '',
                };
            }
            return {
                ...car,
                [name]: value
            };
        }));
    };


    const handleAddCar = () => {
        setCars(prev => ([...prev, { ...defaultCar }]));
    };

    const handleRemoveCar = (idx) => {
        setCars(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ตรวจสอบว่ากดยินยอมข้อมูลส่วนบุคคลหรือยัง
        if (!formData.agreeToTerms) {
            setShowConsentPopup(true);
            alert('กรุณากดยินยอมการใช้ข้อมูลส่วนบุคคลก่อนสมัครสมาชิก');
    
            return;
        }

        // Validation ฟอร์ม
        let errors = {
            first_name: '',
            last_name: '',
            cars: cars.map(() => ({ brand: '', model: '', year: '', license_plate: '' })),
        };
        let hasError = false;
        if (!formData.first_name.trim()) {
            errors.first_name = 'กรุณากรอกชื่อ';
            hasError = true;
        }
        if (!formData.last_name.trim()) {
            errors.last_name = 'กรุณากรอกนามสกุล';
            hasError = true;
        }
        // ต้องมีรถอย่างน้อย 1 คัน
        if (cars.length === 0) {
            alert('กรุณาเพิ่มข้อมูลรถอย่างน้อย 1 คัน');
            hasError = true;
        }
        cars.forEach((car, idx) => {
            if (!car.brand) {
                errors.cars[idx].brand = 'กรุณาเลือกยี่ห้อรถ';
                hasError = true;
            }
            if (!car.model) {
                errors.cars[idx].model = 'กรุณาเลือกแบบรถ';
                hasError = true;
            }
            if (!car.year) {
                errors.cars[idx].year = 'กรุณาเลือกรุ่นปี';
                hasError = true;
            }
            if (!car.license_plate.trim()) {
                errors.cars[idx].license_plate = 'กรุณากรอกเลขทะเบียน';
                hasError = true;
            }
        });
        setFormErrors(errors);
        if (hasError) return;

        // เตรียมข้อมูลสำหรับส่งไปยัง API
        const submitData = {
            line_id: "user11", // TODO: ใช้ LINE ID จริงจาก LIFF
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone || "",
            consent: formData.agreeToTerms,
            cars: cars.map(car => ({
                brand: car.brand,
                model: car.model,
                year: parseInt(car.year),
                license_plate: car.license_plate,
                chassis_number: car.chassis_number.trim() || null
            }))
        };

        try {
            const response = await fetch('https://quickcheck-test.onrender.com/api/v1/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('ลงทะเบียนสำเร็จ!');
                console.log('Registration successful:', result);
                // Redirect to Member page
                window.location.href = '/member';
            } else {
                alert(`เกิดข้อผิดพลาด: ${result.detail || 'ไม่สามารถลงทะเบียนได้'}`);
                console.error('Registration error:', result);
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
            console.error('Network error:', error);
        }
    };

    return (
        <>

            {/* Head */}
            <div className='flex items-center justify-center bg-white/60 h-20'>
                <h1 className='font-bold text-xl text-center text-balance'>QuickCheck member</h1>
            </div>

            {/* Logo Section */}
            <div className="bg-white/60 rounded-md my-2 p-4 items-center justify-center">
                {/* สามารถเปลี่ยนเป็น <img src="/image/qcheck-logo.png" ... /> ได้ */}
                <div className="flex items-center justify-center mt-7 mb-10">
                    <img src="/logo.png" alt="Logo" />
                </div>

                {/* Form Section */}
                <div className="text-lg font-medium mb-1 p-4">
                    <h2 className="text-lg font-semibold text-center mb-6">ลงทะเบียนสมาชิก</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div className="mb-3">
                            <label htmlFor="first_name">
                                ชื่อ <span className="text-red-500 text-xs font-normal"> (ไม่ต้องระบุคำนำหน้าชื่อและอักษรพิเศษ)</span>
                            </label>
                            {formErrors.first_name && (
                                <div className="text-red-500 text-xs mb-1">{formErrors.first_name}</div>
                            )}
                            <input
                                type="varchar"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleUserChange}
                                placeholder="XXXXXXXXXX"
                                className="w-full p-2 border border-gray-500 rounded-full  transition duration-150"
                                required
                            />
                        </div>

                        {/* Last Name Field */}
                        <div className="mb-3">
                            <label htmlFor="last_name">
                                นามสกุล
                            </label>
                            {formErrors.last_name && (
                                <div className="text-red-500 text-xs mb-1">{formErrors.last_name}</div>
                            )}
                            <input
                                type="varchar"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleUserChange}
                                placeholder="XXXXXXXXXX"
                                className="w-full p-2 border border-gray-500 rounded-full transition duration-150"
                                required
                            />
                        </div>

                        {/* Car(s) Section */}
                        {cars.map((car, idx) => (
                            <div key={idx} className="relative">
                                <div className="mb-2 font-semibold text-orange-700 flex items-center justify-between">
                                    <span>รถคันที่ {idx + 1}</span>
                                    {cars.length > 1 && (
                                        <button
                                            type="button"
                                            className="text-xs text-red-500 border border-red-500 rounded-full px-2 py-0.5 ml-2 hover:bg-red-50 transition"
                                            onClick={() => handleRemoveCar(idx)}
                                            aria-label={`ลบรถคันที่ ${idx + 1}`}
                                        >
                                            ยกเลิกการเพิ่มรถ
                                        </button>
                                    )}
                                </div>
                                {/* Car Brand Field */}
                                <div className="mb-3">
                                    <label htmlFor={`brand-${idx}`}>ยี่ห้อรถ</label>
                                    {formErrors.cars[idx] && formErrors.cars[idx].brand && (
                                        <div className="text-red-500 text-xs mb-1">{formErrors.cars[idx].brand}</div>
                                    )}
                                    <select
                                        id={`brand-${idx}`}
                                        name="brand"
                                        value={car.brand}
                                        onChange={(e) => handleCarChange(idx, e)}
                                        className="w-full p-2 border border-gray-500 rounded-full focus:ring-orange-500 appearance-none"
                                    >
                                        <option value="" disabled>--- เลือกยี่ห้อรถ ---</option>
                                        <option value="Toyota">Toyota</option>
                                    </select>
                                </div>
                                {/* Car Model and Year */}
                                <div className="flex gap-3 mb-3">
                                    <div className="flex-1">
                                        <label htmlFor={`model-${idx}`}>แบบรถ</label>
                                        {formErrors.cars[idx] && formErrors.cars[idx].model && (
                                            <div className="text-red-500 text-xs mb-1">{formErrors.cars[idx].model}</div>
                                        )}
                                        <select
                                            id={`model-${idx}`}
                                            name="model"
                                            value={car.model}
                                            onChange={e => handleCarChange(idx, e)}
                                            className="w-full p-2 border border-gray-500 rounded-full focus:ring-orange-500 appearance-none"
                                        >
                                            <option value="" disabled>--- เลือกแบบรถ ---</option>
                                            {CAR_MODELS.map((model) => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor={`year-${idx}`}>รุ่นปี ค.ศ.</label>
                                        {formErrors.cars[idx] && formErrors.cars[idx].year && (
                                            <div className="text-red-500 text-xs mb-1">{formErrors.cars[idx].year}</div>
                                        )}
                                        <select
                                            id={`year-${idx}`}
                                            name="year"
                                            value={car.year}
                                            onChange={e => handleCarChange(idx, e)}
                                            className="w-full p-2 border border-gray-500 rounded-full appearance-none"
                                            disabled={!car.model}
                                        >
                                            <option value="" disabled>--- เลือกรุ่นปี ค.ศ.---</option>
                                            {car.model && CAR_MODEL_YEAR_OPTIONS[car.model].map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* Numberplate Field */}
                                <div className="mb-3">
                                    <label htmlFor={`license_plate-${idx}`}>เลขทะเบียน</label>
                                    {formErrors.cars[idx] && formErrors.cars[idx].license_plate && (
                                        <div className="text-red-500 text-xs mb-1">{formErrors.cars[idx].license_plate}</div>
                                    )}
                                    <input
                                        type="varchar"
                                        id={`license_plate-${idx}`}
                                        name="license_plate"
                                        value={car.license_plate}
                                        onChange={e => handleCarChange(idx, e)}
                                        placeholder="กข 1234 กรุงเทพมหานคร"
                                        className="w-full p-2 border border-gray-500 rounded-full transition duration-150"
                                        required
                                    />
                                </div>
                                {/* Chassis Number Field (optional) */}
                                <div className="mb-3">
                                    <label htmlFor={`chassis_number-${idx}`}>เลขตัวรถ <span className="text-gray-400 text-xs">(ถ้ามี)</span></label>
                                    <input
                                        type="varchar"
                                        id={`chassis_number-${idx}`}
                                        name="chassis_number"
                                        value={car.chassis_number}
                                        onChange={e => handleCarChange(idx, e)}
                                        placeholder="AAAAA12345A123456"
                                        className="w-full p-2 border border-gray-500 rounded-full transition duration-150"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add Car Button */}
                        <div className="flex justify-start mb-3 ">
                            <button
                                type="button"
                                className="bg-[#FF5F25]/80 text-white text-center py-0.5 px-3 rounded-full drop-shadow-lg w-fit"
                                onClick={handleAddCar}
                            >
                                <span className="font-bold">+</span>
                                เพิ่มรถ
                            </button>
                        </div>

                        {/* Privacy Consent Checkbox */}
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="agreeToTerms"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleUserChange}
                                className="hidden"
                                required
                            />
                            <label htmlFor="agreeToTerms" className="flex items-center cursor-pointer mb-3">
                                <span
                                    className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center mr-2 ${formData.agreeToTerms ? 'bg-white' : 'bg-white'}`}
                                    onClick={handleConsentCheckbox}
                                >
                                    <span className={`w-2 h-2 rounded-full transition-opacity duration-150 ${formData.agreeToTerms ? 'bg-orange-500' : 'bg-white opacity-0'}`} />
                                </span>
                                <span className="text-sm text-red-500" onClick={handleConsentCheckbox}>** อนุญาตการใช้ข้อมูลส่วนบุคคล **</span>
                            </label>
                        </div>
                        {/* Consent Popup */}
                        {showConsentPopup && (
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="relative bg-white/80 rounded-lg shadow-lg p-6 max-w-md mx-auto text-center z-10">
                                    <p className="text-base text-gray-800 font-medium mb-4">
                                        ข้าพเจ้ายินยอมให้ QuickCheck จัดเก็บและใช้ข้อมูลชื่อบัญชี LINE เพื่อวัตถุประสงค์ในการติดต่อประสานงานและแจ้งข้อมูลข่าวสารที่เกี่ยวข้อง
                                    </p>
                                    <button
                                        className="mt-2 px-4 py-1 bg-orange-500 text-white rounded-full shadow hover:bg-orange-600 transition"
                                        onClick={() => {
                                            setShowConsentPopup(false);
                                            setFormData(prev => ({ ...prev, agreeToTerms: true }));
                                        }}
                                    >
                                        ยินยอม
                                    </button>
                                </div>
                                <div className="fixed inset-0 bg-black opacity-30 z-0" onClick={() => setShowConsentPopup(false)} />
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="bg-[#FF5F25]/80 text-white text-center py-0.5 px-3 rounded-full drop-shadow-lg w-fit"
                            >
                                สมัครสมาชิก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}