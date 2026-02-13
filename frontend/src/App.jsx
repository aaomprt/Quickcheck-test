import { Route, Routes } from "react-router-dom";

import AssessCarDamage from "./page/AssessCarDamage";
import ResultAssess from "./page/ResultAssess";
import Register from "./page/Register";
import Member from "./page/Member";
import ServiceMap from "./page/ServiceMap";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/map-service" element={<ServiceMap />} />

        <Route element={<PrivateRoute />}>
          <Route path="/assess-car-damage" element={<AssessCarDamage />} />
          <Route path="/assess-car-damage/result/:historyId" element={<ResultAssess />} />
          <Route path="/member" element={<Member />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/member" replace />} />

      </Routes>
    </>
  )
}