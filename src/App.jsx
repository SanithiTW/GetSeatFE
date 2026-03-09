import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import SearchBus from "./pages/SearchBus"
import SeatBooking from "./pages/SeatBooking"
import Checkout from "./pages/Checkout"
import Success from "./pages/Success"


import PassengerDashboard from "./Dashboards/PassengerDashboard"
import AdminDashboard from "./Dashboards/AdminDashboard"

import AdminLogin from "./pages/AdminLogin"
import ProfileSetup from "./pages/ProfileSetup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchBus />} />
        <Route path="/seat/:busId" element={<SeatBooking />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />

        <Route path="/PassengerDashboard" element={<PassengerDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/AdminLoging" element={<AdminLogin />} />
        <Route path="/ProfileSetup" element={<ProfileSetup />} />
      </Routes>
    </BrowserRouter>
  )
}