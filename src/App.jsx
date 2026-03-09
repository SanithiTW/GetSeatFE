<<<<<<< HEAD
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
=======
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
>>>>>>> 04f7858 (code updated)
