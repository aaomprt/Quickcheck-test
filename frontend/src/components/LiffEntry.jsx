import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import liff from "@line/liff";

const LIFF_ID = "2008188161-uQLSDa4M";

export default function LiffEntry() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            await liff.init({ liffId: LIFF_ID });

            // LINE ใส่ liff.state มาให้ เช่น "/map-service"
            const params = new URLSearchParams(location.search);
            const liffState = params.get("liff.state");

            if (liffState) {
                // liffState มักเป็น path ที่ต้องการกลับไป
                navigate(liffState, { replace: true });
                return;
            }

            // fallback
            navigate("/member", { replace: true });
        })().catch((e) => {
            console.error("LIFF entry init error:", e);
            navigate("/member", { replace: true });
        });
    }, [location.search, navigate]);

    return (
        <div className="flex h-screen items-center justify-center font-bold">
            กำลังเข้าสู่ระบบ...
        </div>
    );
}
