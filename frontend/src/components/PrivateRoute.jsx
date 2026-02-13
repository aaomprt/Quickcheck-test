import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import liff from "@line/liff";

export default function PrivateRoute() {
    const [status, setStatus] = useState('loading');
    const location = useLocation();

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                await liff.init({ liffId: "2008188161-uQLSDa4M" });
                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }
                const profile = await liff.getProfile();
                
                // เรียก Endpoint check_user
                const response = await fetch(`https://quickcheck-test.onrender.com/api/v1/check_user/${profile.userId}`);
                
                if (response.ok) {
                    // ถ้าพบ User (HTTP 200) ให้ไปต่อที่หน้า Member
                    setStatus('registered');
                } else if (response.status === 404) {
                    // ถ้าไม่พบ User (HTTP 404) ให้ไปหน้า Register
                    setStatus('not-registered');
                } else {
                    throw new Error("Server error");
                }
            } catch (err) {
                console.error("Auth Check Error:", err);
                setStatus('not-registered');
            }
        };
        checkUserStatus();
    }, []);

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center font-bold">กำลังตรวจสอบสถานะ...</div>;
    }

    return status === 'registered' 
        ? <Outlet /> 
        : <Navigate to="/register" state={{ from: location }} replace />;
}