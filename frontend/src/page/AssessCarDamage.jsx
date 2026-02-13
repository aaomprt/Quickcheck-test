import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import liff from '@line/liff';
import { select_part } from '../assets/Data.jsx';

import { TbPhotoPlus } from "react-icons/tb";
import { IoTrashBin } from "react-icons/io5";

const API_BASE_URL = 'https://quickcheck-test.onrender.com/api/v1';
const LIFF_ID = '2008188161-uQLSDa4M';
const MAX_IMAGES = 7;

// Damage Box
function DamageItemRow({ item, onPartChange, onFileChange, onRemoveImage, onRemoveRow, isOnlyOne, selectedParts }) {
    const currentPart = select_part.find(p => p.value === item.part) || select_part[0];

    return (
        <div className='mt-4'>
            {/* ส่วนเลือกอะไหล่ */}
            <div className='flex items-center w-2/3 px-4 py-1 my-2 h-10 bg-white rounded-xl drop-shadow-sm gap-2'>
                <img src={currentPart.img} alt={currentPart.label} className={currentPart.className || 'w-6'} />
                <select
                    value={item.part}
                    onChange={(e) => onPartChange(item.id, e.target.value)}
                    className='w-full bg-transparent focus:outline-none'
                >
                    {select_part.map((part) => (
                        <option
                            key={part.value}
                            value={part.value}
                            disabled={selectedParts.has(part.value) && part.value !== item.part}
                        >
                            {part.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* ส่วน Upload */}
            <div className="relative bg-white rounded-xl min-h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100">
                {!isOnlyOne && (
                    <button
                        type="button"
                        onClick={() => onRemoveRow(item.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 border border-gray-300 rounded-lg px-2 text-xs z-10"
                    >
                        ยกเลิกแถว
                    </button>
                )}

                <label htmlFor={`file-${item.id}`} className='w-full h-full cursor-pointer p-4'>
                    {item.previewUrl ? (
                        <div className="flex flex-col items-center gap-3">
                            <img src={item.previewUrl} alt="preview" className="max-h-48 object-contain rounded-lg" />
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); onRemoveImage(item.id); }}
                                className="text-red-500 flex items-center gap-1 text-sm font-medium"
                            >
                                <IoTrashBin size={18} /> ลบรูปภาพ
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center opacity-40 py-10">
                            <TbPhotoPlus size={40} className='mb-2' />
                            <p>คลิกเพื่อถ่ายภาพหรืออัปโหลด</p>
                        </div>
                    )}
                    <input
                        id={`file-${item.id}`}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => onFileChange(item.id, e)}
                    />
                </label>
            </div>
        </div>
    );
};

export default function AssessCarDamage() {
    const navigate = useNavigate();
    const [lineId, setLineId] = useState('');
    const [user, setUser] = useState(null);
    const [cars, setCars] = useState([]);
    const [selectedCar, setSelectedCar] = useState('');
    const [loading, setLoading] = useState(true);
    const [damageItems, setDamageItems] = useState([{ id: Date.now(), part: '', file: null, previewUrl: '' }]);

    // ดึงข้อมูลผู้ใช้และรถยนต์
    useEffect(() => {
        const initApp = async () => {
            try {
                await liff.init({ liffId: LIFF_ID });
                if (!liff.isLoggedIn()) {
                    window.location.replace("/member");
                    return;
                }

                const profile = await liff.getProfile();
                setLineId(profile.userId);

                const res = await fetch(`${API_BASE_URL}/user/${profile.userId}`);
                if (!res.ok) throw new Error("ไม่พบข้อมูลผู้ใช้");
                const data = await res.json();

                setUser(data.user);
                setCars(Array.isArray(data.cars) ? data.cars : []);
            } catch (e) {
                console.error("Initialization error:", e);
                alert(e.message);
            } finally {
                setLoading(false);
            }
        };
        initApp();
    }, []);

    // ล้าง Memory สำหรับ Blob URL
    useEffect(() => {
        return () => damageItems.forEach(item => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    }, []);

    const handlePartChange = (id, value) => {
        const isDuplicated = damageItems.some(item => item.id !== id && item.part === value);
        if (isDuplicated) return alert('อะไหล่นี้ถูกเลือกไปแล้ว');

        setDamageItems(prev => prev.map(item => item.id === id ? { ...item, part: value } : item));
    };

    const handleFileChange = (id, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setDamageItems(prev => prev.map(item => {
            if (item.id === id) {
                if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                return { ...item, file, previewUrl };
            }
            return item;
        }));
    };

    const handleRemoveImage = (id) => {
        setDamageItems(prev => prev.map(item => {
            if (item.id === id) {
                URL.revokeObjectURL(item.previewUrl);
                return { ...item, file: null, previewUrl: '' };
            }
            return item;
        }));
    };

    const handleAddRow = () => {
        if (damageItems.length >= MAX_IMAGES) return alert(`อัปโหลดได้สูงสุด ${MAX_IMAGES} รูป`);
        setDamageItems(prev => [...prev, { id: Date.now(), part: '', file: null, previewUrl: '' }]);
    };

    const handleRemoveRow = (id) => {
        setDamageItems(prev => {
            const item = prev.find(i => i.id === id);
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
            return prev.filter(i => i.id !== id);
        });
    };

    const selectedPartsSet = new Set(damageItems.map(i => i.part).filter(Boolean));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCar) {
            return alert('กรุณาเลือกรถยนต์');
        }

        if (damageItems.some(i => !i.part || !i.file)) {
            return alert('กรุณาระบุอะไหล่และอัปโหลดรูปให้ครบทุกรายการ');
        }

        try {
            const fd = new FormData();
            fd.append("license_plate", selectedCar);
            fd.append("items", JSON.stringify(damageItems.map(i => ({ part_type: i.part }))));
            damageItems.forEach(i => fd.append("images", i.file));

            const res = await fetch(`${API_BASE_URL}/assess_damage`, { method: "POST", body: fd });
            if (!res.ok) throw new Error("ส่งข้อมูลไม่สำเร็จ");

            const data = await res.json();
            navigate(`/result/${data.history_id}`);
        } catch (e) {
            alert(e.message);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="max-w-md mx-auto pb-10">
            <header className='flex items-center justify-center bg-white/60 h-20 shadow-sm'>
                <h1 className='font-bold text-xl'>การประเมินความเสียหาย</h1>
            </header>

            <section className='bg-white/60 my-2 rounded-md p-4 shadow-sm'>
                <div className='flex items-center gap-3 mb-4'>
                    <img src="icon/user.png" alt="user" className='w-6' />
                    <p className='font-semibold text-lg'>คุณ {user?.first_name || 'สมาชืก'}</p>
                </div>
                <div className='flex items-center gap-3'>
                    <img src="icon/car.png" alt="car" className='w-6' />
                    <select
                        className='flex-1 p-2 bg-white rounded-xl border border-gray-200'
                        value={selectedCar}
                        onChange={(e) => setSelectedCar(e.target.value)}
                    >
                        <option value="" disabled>-- เลือกรถยนต์ของคุณ --</option>
                        {cars.map(c => (
                            <option key={c.license_plate} value={c.license_plate}>
                                {c.brand} {c.model} ({c.license_plate})
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <main className='bg-white/60 rounded-md p-4 shadow-sm'>
                <h3 className='font-semibold text-lg text-center mb-4'>รายการความเสียหาย</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {damageItems.map((item) => (
                        <DamageItemRow
                            key={item.id}
                            item={item}
                            onPartChange={handlePartChange}
                            onFileChange={handleFileChange}
                            onRemoveImage={handleRemoveImage}
                            onRemoveRow={handleRemoveRow}
                            isOnlyOne={damageItems.length === 1}
                            selectedParts={selectedPartsSet}
                        />
                    ))}

                    <div className='flex flex-col items-center gap-4 pt-4'>
                        {damageItems.length < MAX_IMAGES && (
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className='bg-white/80 text-gray-600 py-2 px-6 rounded-full text-sm border border-gray-300'
                            >
                                + เพิ่มจุดเสียหายอื่น
                            </button>
                        )}
                        <button
                            type="submit"
                            className='bg-[#FF5F25] text-white py-3 px-10 rounded-full font-bold shadow-lg active:scale-95 transition-transform'
                        >
                            เริ่มประเมินความเสียหาย
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}