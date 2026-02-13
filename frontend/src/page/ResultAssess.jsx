import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GoSearch } from "react-icons/go";

const API_BASE_URL = 'https://quickcheck-test.onrender.com';

export default function ResultAssess() {
    const { historyId } = useParams();
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // slider state
    const sliderRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const loadResult = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/result/${historyId}`);
                if (!res.ok) throw new Error("โหลดผลประเมินไม่สำเร็จ");
                
                const data = await res.json();
                if (isMounted) {
                    setResult(data);
                    setActiveIndex(0);
                }
            } catch (err) {
                alert(err.message);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadResult();
        return () => { isMounted = false; };
    }, [historyId]);

    // filter อะไหล่ระดับ Moderate/Severe
    const costItems = useMemo(() => {
        return result?.items?.filter((x) => ["Moderate", "Severe"].includes(x.damage_level)) || [];
    }, [result]);

    // cost format utility
    const formatCost = (num) =>
        (Number(num) || 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const handleSliderScroll = (e) => {
        const el = e.currentTarget;
        const slideWidth = el.offsetWidth;
        if (slideWidth > 0) {
            const idx = Math.round(el.scrollLeft / slideWidth);
            setActiveIndex(idx);
        }
    };

    const scrollToIndex = (idx) => {
        const el = sliderRef.current;
        if (el) {
            const slideWidth = el.offsetWidth;
            el.scrollTo({ left: idx * slideWidth, behavior: "smooth" });
            setActiveIndex(idx);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center font-medium">กำลังประมวลผล...</div>;
    }

    if (!result) {
        return <div className="p-10 text-center">ไม่พบข้อมูลผลประเมิน</div>;
    }

    const totalSlides = result.items?.length || 0;

    return (
        <>
            {/* Head */}
            <div className="flex items-center justify-center bg-white/60 h-20">
                <h1 className="font-bold text-xl text-center text-balance">
                    รายละเอียด <br />การประเมินความเสียหาย
                </h1>
            </div>

            <div className="bg-white/60 rounded-md my-2 p-4">
                {/* User car info */}
                <div className="mb-5">
                    <div className="flex items-center gap-5 ml-1">
                        <img src="/icon/user.png" alt="user" className="w-6" />
                        <p className="font-semibold text-lg">คุณ {result.user_name || '-'}</p>
                    </div>

                    <div className="flex items-center mt-3 gap-4">
                        <img src="/icon/car.png" alt="car" className="w-8" />
                        <p>{result.car_brand} {result.car_model}</p>
                    </div>

                    {/* Image car user slider */}
                    <div className="bg-white my-3 rounded-xl p-4 h-full">
                        <div className="relative">
                            <div
                                ref={sliderRef}
                                onScroll={handleSliderScroll}
                                className="flex rounded-box w-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
                                style={{
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                }}
                            >
                                {result.items?.map((item, index) => (
                                    <div key={index} className="w-full snap-center shrink-0">
                                        <img
                                            src={`${API_BASE_URL}/${item.image_path}`}
                                            alt={`damage-part-${index}`}
                                            className="w-full h-52 object-cover rounded-xl"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Dots Indicator */}
                            {totalSlides > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    {result.items.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => scrollToIndex(i)}
                                            className={`h-2 w-2 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-gray-800 w-4" : "bg-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="opacity-40" />

                {/* Result Assess Section */}
                <div className="my-3">
                    <div className="flex items-center gap-1">
                        <img src="/icon/car-crash.png" alt="car-crash" className="w-11" />
                        <h2 className="text-lg font-semibold">ระดับความเสียหาย</h2>
                    </div>

                    <div className="mt-2 space-y-3">
                        {result.items?.map((item, index) => (
                            <div key={index} className="grid grid-cols-3 items-center">
                                <p className="col-span-2 text-sm font-medium">{item.part_name_th}</p>
                                <p className={`rounded-full text-center drop-shadow-md text-sm py-0.5 ${
                                    item.damage_level === "Minor" ? "bg-[#FFE3BB]" : 
                                    item.damage_level === "Moderate" ? "bg-[#FFE3BB]" : "bg-[#FF5F25] text-white"
                                }`}>
                                    {item.damage_level === "Minor" ? "ชนเบา" : 
                                     item.damage_level === "Moderate" ? "ชนปานกลาง" : "ชนหนัก"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <hr className="opacity-40 mt-5" />

                {/* Cost Section */}
                <div className="my-3">
                    <div className="flex items-center mb-2 gap-2">
                        <img src="/icon/cost.png" alt="cost" className="w-8" />
                        <h2 className="text-lg font-semibold">ค่าใช้จ่ายเบื้องต้น</h2>
                        <p className="bg-[#FF5F25] text-[10px] text-white px-2 py-0.5 rounded-full uppercase">
                            Estimate
                        </p>
                    </div>

                    {costItems.length > 0 ? (
                        <div className="space-y-2">
                            {costItems.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <p>{item.part_name_th}</p>
                                    <p className="font-mono">{formatCost(item.price)}</p>
                                </div>
                            ))}

                            <hr className="opacity-40 my-3" />

                            <div className="text-center">
                                <p className="font-bold text-lg">
                                    ราคาประมาณการ{" "}
                                    {Number(result.total_cost || 0).toLocaleString("th-TH")} บาท
                                </p>
                                <p className="text-[10px] mt-1 text-[#FF4F0F] font-medium italic">
                                    ** ราคานี้ยังไม่รวมค่าทำสี ค่าแรง และ Vat **
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic text-center py-2">ไม่มีรายการที่ต้องประเมินราคา</p>
                    )}
                </div>

                {/* Map Navigation Link */}
                <div className="bg-white w-fit px-4 py-1.5 rounded-full drop-shadow-md opacity-80 m-auto mt-6 border border-gray-100">
                    <Link to="/map-service" className="flex gap-2 items-center text-gray-700">
                        <GoSearch className="text-orange-500" />
                        <p className="text-xs font-semibold">ค้นหาศูนย์ซ่อมใกล้ฉัน</p>
                    </Link>
                </div>
            </div>
        </>
    );
}