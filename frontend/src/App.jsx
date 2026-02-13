import { Route, Routes } from "react-router-dom";

import AssessCarDamage from "./page/AssessCarDamage";
import ResultAssess from "./page/ResultAssess";
import Register from "./page/Register";
import Member from "./page/Member";
import ServiceMap from "./page/ServiceMap";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/assess-car-damage" element={<AssessCarDamage />} />
        <Route path="/assess-car-damage/result/:historyId" element={<ResultAssess />} />
        <Route path="/register" element={<Register />} />
        <Route path="/member" element={<Member/>} />
        <Route path="/map-service" element={<ServiceMap />} />
      </Routes>
    </>
  )
}