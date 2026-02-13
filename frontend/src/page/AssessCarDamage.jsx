import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { select_part } from '../assets/Data.jsx';

import { TbPhotoPlus } from "react-icons/tb";
import { IoTrashBin } from "react-icons/io5";

export default function AssessCarDamage() {
    const [selectedCar, setSelectedCar] = useState('')
    const navigate = useNavigate();
    const max_image = 7

    const [user, setUser] = useState(null);
    const [cars, setCars] = useState([]);
    const [loadingCars, setLoadingCars] = useState(true);

    const [damageItems, setDamageItems] = useState([
        {
            id: Date.now(),
            part: '',
            file: null,
            previewUrl: ''
        }
    ])

    useEffect(() => {
        const loadCars = async () => {
            try {
                setLoadingCars(true);
                const lineId = "user11";
                const res = await fetch(`http://localhost:8000/api/v1/user/${lineId}`);
                if (!res.ok) throw new Error("โหลดรายการรถไม่สำเร็จ");
                const data = await res.json();

                setUser(data.user || null);
                setCars(Array.isArray(data.cars) ? data.cars : []);
            } catch (e) {
                alert(e.message || "โหลดรายการรถไม่สำเร็จ");
            } finally {
                setLoadingCars(false);
            }
        };
        loadCars();
    }, []);

    // สำหรับเปลี่ยนรูปอะไหล่ที่เลือก
    const handlePartChange = (id, event) => {
        const value = event.target.value

        // ถ้าอะไหล่นี้ถูกเลือกในแถวอื่นแล้ว ให้ arert
        const duplicated = damageItems.some(i => i.id !== id && i.part === value)
        if (duplicated) {
            alert('อะไหล่นี้ถูกเลือกไปแล้ว กรุณาเลือกอะไหล่อื่น')
            return
        }

        setDamageItems(items =>
            items.map(item =>
                item.id === id ? { ...item, part: value } : item
            )
        )
    }

    // อัปโหลดรูปภาพ
    const handleFileChange = (id, event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const previewUrl = URL.createObjectURL(file)

        setDamageItems(items =>
            items.map(item =>
                item.id === id ? { ...item, file, previewUrl } : item
            )
        )
    }

    // เพิ่มรูปภาพ
    const handleAddImage = (event) => {
        event.preventDefault()

        const availableParts = select_part
            .map(p => p.value)
            .filter(v => v !== '' && !selectedParts.has(v))

        if (availableParts.length === 0) {
            alert('ไม่สามารถเพิ่มได้: เลือกอะไหล่ครบแล้ว')
            return
        }

        setDamageItems(items => [
            ...items,
            {
                id: Date.now() + Math.random(),
                part: '',
                file: null,
                previewUrl: ''
            }
        ])
    }

    // ลบรูปภาพ
    const handleRemoveImage = (id) => {
        setDamageItems(items =>
            items.map(item => {
                if (item.id !== id) return item
                if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
                return { ...item, file: null, previewUrl: '' }
            })
        )
    }

    // ลบ box upload
    const handleRemoveRow = (id) => {
        setDamageItems((items) => {
            const target = items.find((i) => i.id === id)
            if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
            return items.filter((i) => i.id !== id)
        })
    }

    // เก็บชุดอะไหล่ที่ถูกเลือกแล้ว
    const selectedParts = new Set(damageItems.map(i => i.part).filter(Boolean))

    // ตรวจสอบความถูกต้องของฟอร์ม
    const validateForm = () => {
        // ต้องเลือกรถ
        if (!selectedCar) {
            alert('กรุณาเลือกรถยนต์')
            return false
        }

        // ต้องเลือกอะไหล่
        const missingPart = damageItems.some(item => !item.part)
        if (missingPart) {
            alert('กรุณาเลือกอะไหล่ให้ครบทุกภาพ')
            return false
        }

        // ต้องมีรูป
        const missingImage = damageItems.some(item => !item.file)
        if (missingImage) {
            alert('กรุณาอัปโหลดรูปภาพให้ครบทุกอะไหล่')
            return false
        }

        return true
    }

    // Submit form send to backend
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        const fd = new FormData()

        // car
        fd.append("license_plate", selectedCar)

        // part_type
        fd.append(
            "items", JSON.stringify(
                damageItems.map((i) => ({
                    part_type: i.part,
                }))
            )
        )

        // image car
        damageItems.forEach((i) => {
            fd.append("images", i.file)
        })

        const res = await fetch("http://localhost:8000/api/v1/assess_damage", {
            method: "POST",
            body: fd,
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            alert(err.detail || "ส่งข้อมูลไม่สำเร็จ")
            return
        }

        const data = await res.json()

        navigate(`result/${data.history_id}`);
    }

    return (
        <>
            {/* Head */}
            <div className='flex items-center justify-center bg-white/60 h-20'>
                <h1 className='font-bold text-xl'>การประเมินความเสียหาย</h1>
            </div>

            {/* User car info */}
            <div className='bg-white/60 my-2 rounded-md p-4'>
                <div className='flex items-center gap-5 ml-1'>
                    <img src="icon/user.png" alt="user" className='w-6' />
                    <p className='font-semibold text-lg'>
                        คุณ {loadingCars ? "กำลังโหลด..." : (user?.first_name ?? "-")}
                    </p>
                </div>
                <div className='flex mt-3 gap-4'>
                    <img src="icon/car.png" alt="car" className='w-8' />
                    <div className='flex items-center px-2 bg-white rounded-xl drop-shadow-sm'>
                        <select
                            name="user-car"
                            value={selectedCar}
                            onChange={(e) => setSelectedCar(e.target.value)}
                        >
                            <option value="" disabled>-- เลือกรถยนต์ --</option>
                            {cars.map((c) => (
                                <option key={c.license_plate} value={c.license_plate}>
                                    {c.brand || ""} {c.model || ""} ({c.license_plate})
                                </option>
                            ))}
                        </select>

                    </div>
                </div>
            </div>

            {/* Select part and Upload car image */}
            <div className='bg-white/60 rounded-md p-4'>
                <h3 className='font-semibold text-lg text-center'>ถ่าย/อัปโหลดรูปความเสียหาย</h3>

                <form onSubmit={handleSubmit}>
                    {damageItems.map((item) => (
                        <div key={item.id} className='mt-2'>

                            {/* Select car part */}
                            <div className='flex justify-between'>
                                <div className='flex items-center w-2/3 px-4 py-1 my-2 h-8 bg-white rounded-xl drop-shadow-sm gap-2'>
                                    {(() => {
                                        const partObj = select_part.find(p => p.value === item.part) || select_part[0]
                                        return (
                                            <img
                                                src={partObj.img}
                                                alt={partObj.label}
                                                className={partObj.className}
                                            />
                                        )
                                    })()}

                                    <select
                                        name="car-part"
                                        value={item.part}
                                        onChange={(e) => handlePartChange(item.id, e)}
                                        className='w-full'
                                    >
                                        {select_part.map((part, index) => {
                                            const isTaken = selectedParts.has(part.value) && part.value !== item.part
                                            return (
                                                <option value={part.value} key={part.value ?? index} disabled={isTaken}>
                                                    {part.label}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* Upload area + preview */}
                            <div className="relative bg-white rounded-xl h-70 flex flex-col items-center">

                                {/* ปุ่มลบกล่อง upload */}
                                <button
                                    type="button"
                                    onClick={() => { handleRemoveRow(item.id) }}
                                    hidden={damageItems.length <= 1}
                                    className="absolute right-3 text-gray-500 border-gray-500 text-sm border rounded-lg mt-3 px-2 z-10"
                                >
                                    ยกเลิก
                                </button>

                                <label htmlFor={`dropzone-file-${item.id}`} className='w-full cursor-pointer'>
                                    {item.previewUrl ? (
                                        <div className="px-4 pt-10 h-65 flex flex-col justify-center gap-3">
                                            {/* preview image */}
                                            <div className="m-auto">
                                                <img
                                                    src={item.previewUrl}
                                                    alt="preview"
                                                    className="max-h-48 object-contain rounded-lg"
                                                />
                                            </div>

                                            {/* ปุ่มลบรูป */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleRemoveImage(item.id)
                                                }}
                                                className="text-red-600 m-auto"
                                            >
                                                <IoTrashBin size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-70 flex flex-col items-center justify-center opacity-40">
                                            <TbPhotoPlus size={25} className='mb-4' />
                                            <p className="mb-2">Click to upload or take photo</p>
                                        </div>
                                    )}

                                    <input
                                        id={`dropzone-file-${item.id}`}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={(e) => handleFileChange(item.id, e)}
                                    />
                                </label>
                            </div>
                        </div>
                    ))}

                    <div className='flex flex-col items-center mt-3 gap-4'>
                        {/* ปุ่มเพิ่มรูป */}
                        <button
                            type="button"
                            onClick={handleAddImage}
                            hidden={damageItems.length >= max_image}
                            className='bg-white opacity-40 text-center py-0.5 px-3 rounded-full w-fit text-sm'
                        >
                            + เพิ่มรูปภาพ
                        </button>

                        {/* ปุ่ม submit */}
                        <button
                            type="submit"
                            className='bg-[#FF5F25]/80 text-white text-center py-0.5 px-3 rounded-full drop-shadow-lg w-fit'
                        >
                            ประเมินความเสียหาย
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}