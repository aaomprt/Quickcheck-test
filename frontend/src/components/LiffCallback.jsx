import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import liff from "@line/liff";

export default function LiffCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            await liff.init({ liffId: "2008188161-uQLSDa4M" });
            navigate("/member", { replace: true });
        })();
    }, [navigate]);

    return (
        <div className="flex h-screen items-center justify-center font-bold">กำลังเข้าสู่ระบบ...</div>
    );
}
