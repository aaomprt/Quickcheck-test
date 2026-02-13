import { Route, Routes, useNavigate, useLocation } from "react-router-dom";

import AssessCarDamage from "./page/AssessCarDamage";
import ResultAssess from "./page/ResultAssess";
import Register from "./page/Register";
import Member from "./page/Member";
import ServiceMap from "./page/ServiceMap";

function LiffRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const liffState = searchParams.get('liff.state');

    if (liffState) {
      navigate(liffState, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  return (
    <>
      <LiffRedirectHandler />

      <Routes>
        <Route path="/assess-car-damage" element={<AssessCarDamage />} />
        <Route path="/assess-car-damage/result/:historyId" element={<ResultAssess />} />
        <Route path="/register" element={<Register />} />
        <Route path="/member" element={<Member />} />
        <Route path="/map-service" element={<ServiceMap />} />
      </Routes>
    </>
  )
}