import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GoSearch } from "react-icons/go";

export default function ResultAssess() {
    const { historyId } = useParams();
    const [result, setResult] = useState(null);

    // slider state
    const sliderRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`http://localhost:8000/api/v1/result/${historyId}`);
            if (!res.ok) {
                alert("โหลดผลประเมินไม่สำเร็จ");
                return;
            }
            const data = await res.json();
            setResult(data);
            setActiveIndex(0);
        };
        load();
    }, [historyId]);

    // filter อะไหล่ระดับ Moderate/Severe
    const costItems = useMemo(() => {
        if (!result) return [];
        return result.items.filter((x) => ["Moderate", "Severe"].includes(x.damage_level));
    }, [result]);

    if (!result) return <div className="p-4">Loading...</div>;

    // cost format
    const formatCost = (num) =>
        (Number(num) || 0).toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const totalSlides = result.items?.length || 0;

    const handleSliderScroll = (e) => {
        const el = e.currentTarget;
        const slideWidth = el.clientWidth || 1;
        const idx = Math.round(el.scrollLeft / slideWidth);
        setActiveIndex(Math.max(0, Math.min(idx, totalSlides - 1)));
    };

    const scrollToIndex = (idx) => {
        const el = sliderRef.current;
        if (!el) return;
        const slideWidth = el.clientWidth || 0;
        el.scrollTo({ left: idx * slideWidth, behavior: "smooth" });
        setActiveIndex(idx);
    };

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
                        <p className="font-semibold text-lg">คุณ {result.user_name}</p>
                    </div>

                    <div className="flex items-center mt-3 gap-4">
                        <img src="/icon/car.png" alt="car" className="w-8" />
                        <p>{result.car_brand} {result.car_model}</p>
                    </div>

                    {/* Image car user */}
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
                                {result.items.map((item, index) => (
                                    <div key={index} className="w-full snap-center shrink-0">
                                        <img
                                            src={`http://localhost:8000/${item.image_path}`}
                                            alt={`car-${index}`}
                                            className="w-full h-50 object-cover rounded-xl"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Dots */}
                            {totalSlides > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    {Array.from({ length: totalSlides }).map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => scrollToIndex(i)}
                                            aria-label={`slide-${i + 1}`}
                                            className={`h-2 w-2 rounded-full transition-all ${i === activeIndex ? "bg-gray-800" : "bg-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="opacity-40" />

                {/* Result Assess */}
                <div className="my-3">
                    <div className="flex items-center gap-1">
                        <img src="/icon/car-crash.png" alt="car-crash" className="w-11" />
                        <h2 className="text-lg font-semibold">ระดับความเสียหาย</h2>
                    </div>

                    <div>
                        {result.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-3 mb-3 items-center">
                                <p className="col-span-2">{item.part_name_th}</p>
                                {item.damage_level === "Minor" ? (
                                    <p className="bg-[#FFE3BB] rounded-full text-center drop-shadow-md">ชนเบา</p>
                                ) : item.damage_level === "Moderate" ? (
                                    <p className="bg-[#FFE3BB] rounded-full text-center drop-shadow-md">ชนปานกลาง</p>
                                ) : (
                                    <p className="bg-[#FF5F25] rounded-full text-center drop-shadow-md">ชนหนัก</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <hr className="opacity-40 mt-5" />

                {/* Cost */}
                <div className="my-3">
                    <div className="flex items-center mb-2 gap-2">
                        <img src="/icon/cost.png" alt="cost" className="w-8" />
                        <h2 className="text-lg font-semibold">ค่าใช้จ่ายเบื้องต้น</h2>
                        <p className="bg-[#FF5F25] text-xs text-white px-2 py-0.5 rounded-full">
                            ชนปานกลาง, หนัก
                        </p>
                    </div>

                    {costItems.length > 0 ? (
                        <>
                            {costItems.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <p>{item.part_name_th}</p>
                                    <p>{formatCost(Number(item.price) || 0)}</p>
                                </div>
                            ))}

                            <hr className="opacity-40 my-3" />

                            <div className="text-center">
                                <p>
                                    ราคาประมาณการ{" "}
                                    {result.total_cost.toLocaleString("th-TH", { maximumFractionDigits: 0 })} บาท
                                </p>
                                <p className="text-xs mt-1 text-[#FF4F0F]">
                                    ** ราคานี้ยังไม่รวมค่าทำสี ค่าแรง และ Vat **
                                </p>
                            </div>
                        </>
                    ) : (
                        <p>ไม่มีค่าใช้จ่าย</p>
                    )}
                </div>

                {/* link to map page */}
                <div className="bg-white w-fit px-3 py-1 rounded-full drop-shadow-md opacity-60 m-auto">
                    <Link to="/map-service" className="flex gap-1 items-center">
                        <GoSearch />
                        <p className="text-sm">ค้นหาศูนย์ซ่อมใกล้ฉัน</p>
                    </Link>
                </div>
            </div>
        </>
    );
}
