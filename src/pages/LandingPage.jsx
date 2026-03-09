import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Assets
import Logo from '../assets/GetSeat_logo.jpg';
import busIcon from '../assets/bus.png';
import seatIcon from '../assets/seat.jpg';
import ticketIcon from '../assets/ticket.jpg';
import cityIcon from '../assets/city.png';

// Import Firestore functions
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, databaseb } from "../firebase"; 
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";


const features = [
    { title: "Search Buses Easily", icon: cityIcon, desc: "Find buses instantly by selecting your origin, destination, and travel date." },
    { title: "Interactive Seat Selection", icon: seatIcon, desc: "Choose your preferred seat using our real-time seat layout." },
    { title: "Secure Online Payment", icon: ticketIcon, desc: "Pay safely using trusted payment gateways and confirm your booking instantly." },
    { title: "Real-time Seat Availability", icon: busIcon, desc: "See live seat availability and avoid double booking with real-time updates." },
    { title: "Instant Ticket Confirmation", icon: ticketIcon, desc: "Receive your e-ticket instantly after successful payment." },
    { title: "Manage My Bookings", icon: seatIcon, desc: "View booking history, manage tickets, and track your journeys anytime." }
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeSearchTab, setActiveSearchTab] = useState('oneWay');
    const searchRef = useRef(null);

    // --- OTP Login States ---
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef([]);

    // Reset modal state when closed
    const closeLogin = () => {

  setIsLoginOpen(false);

  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }

  setStep(1);
  setPhone('');
  setOtp(['', '', '', '', '', '']);
  setError('');

};

    // Step 1: Handle Send OTP
    const handleSendOTP = async (e) => {

  e.preventDefault();
  setError("");

  if (!phone) return setError("Phone number is required");

  const phoneRegex = /^[0-9]{9}$/;
  if (!phoneRegex.test(phone))
    return setError("Enter a valid 9 digit mobile number");

  const fullPhone = "+94" + phone;

  try {

    setIsLoading(true);

    const appVerifier = window.recaptchaVerifier;

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      fullPhone,
      appVerifier
    );

    window.confirmationResult = confirmationResult;

    setIsLoading(false);
    setStep(2);

  } catch (error) {

    console.error(error);
    setIsLoading(false);
    setError("Failed to send OTP");

  }

};

    // Step 2: Handle OTP Input (Auto-focus logic)
    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next field
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOTP = async () => {
  const otpCode = otp.join("");

  try {
    setIsLoading(true);

    // Verify OTP
    const result = await window.confirmationResult.confirm(otpCode);
    const user = result.user; // logged-in user
    console.log("Logged in user:", user);

    const userRef = doc(databaseb, "passengers", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // New user → first write phone to Firestore
      await setDoc(userRef, {
        phone: user.phoneNumber,
        createdAt: Date.now(),
      });

      // Navigate to Profile Setup **before closing login modal**
      navigate("/ProfileSetup", { state: { uid: user.uid, phone: user.phoneNumber } });
    } else {
      // Existing user → dashboard
      navigate("/PassengerDashboard");
    }

    // Close login modal after navigation
    closeLogin();
    setIsLoading(false);

  } catch (error) {
    console.error(error);
    setError("Invalid OTP");
    setIsLoading(false);
  }
};

    // Auto-submit when last digit is entered
    useEffect(() => {
        if (otp.every(digit => digit !== '') && step === 2) {
            handleVerifyOTP();
        }
    }, [otp]);

   useEffect(() => {

  if (!isLoginOpen) return;

  setTimeout(() => {

    if (!window.recaptchaVerifier) {

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("Recaptcha solved");
          }
        }
      );

    }

  }, 300);

}, [isLoginOpen]);

    const AnimatedCounter = ({ endValue, label }) => {
        const ref = useRef(null);
        const isInView = useInView(ref, { once: true, amount: 0.5 });
        return (
            <div className="counter-item" ref={ref}>
                <span className="counter-number">
                    {isInView ? <CountUp end={endValue} duration={2.5} separator="," /> : 0}+
                </span>
                <p className="counter-label">{label}</p>
            </div>
        );
    };

    return (
        <div className="landing-page">
            {/* Login Modal */}
            <AnimatePresence>
                {isLoginOpen && (
                    <div className="modal-overlay" onClick={closeLogin}>
                        <motion.div 
                            className="login-modal"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="close-modal" onClick={closeLogin}>&times;</button>
                            
                            {step === 1 ? (
                                <>
                                    <h2>Login with Phone Number</h2>
                                    <p>Enter your details to receive an OTP</p>
                                    <form onSubmit={handleSendOTP} className="otp-form">
                                        
                                        <div className="phone-field">
                                            <div className="country-code">🇱🇰 +94</div>
                                            <input 
                                                type="tel" 
                                                placeholder="77 123 4567" 
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                                maxLength="9"
                                            />
                                        </div>
                                        {error && <p className="error-text">{error}</p>}
                                        <button type="submit" className="otp-btn" disabled={isLoading}>
                                            {isLoading ? <div className="spinner"></div> : "Send OTP"}
                                        </button>
                                        <div id="recaptcha-container"></div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h2>Enter OTP</h2>
                                    <p>Sent to +94 {phone.replace(/.(?=.{4})/g, 'X')}</p>
                                    <div className="otp-input-container">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (otpRefs.current[index] = el)}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>
                                    <button className="otp-btn" onClick={handleVerifyOTP} disabled={isLoading}>
                                        {isLoading ? <div className="spinner"></div> : "Verify OTP"}
                                    </button>
                                    <button className="resend-btn" onClick={() => setStep(1)}>Resend OTP</button>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header className="header">
                <div className="logo-container">
                    <h2 className="text-logo">Get<span>Seat</span></h2>
                </div>
                <nav className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#search">Book Now</a>
                    <a href="#stats">Impact</a>
                </nav>
                <div className="auth-buttons">
                    <button className="btn-primary" onClick={() => setIsLoginOpen(true)}>
                        Login with Phone
                    </button>
                </div>
            </header>

            <section className="hero-modern">
                <div className="mesh-gradient"></div>
                <div className="hero-content">
                    <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-badge">
                         Smart Bus Booking Platform
                    </motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        Your Gateway to <span className="text-gradient">Seamless</span> Travel
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        Search buses, choose your seat, and book tickets instantly.
                    </motion.p>
                    <motion.div className="hero-cta" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                        <button className="main-cta" onClick={() => searchRef.current.scrollIntoView({ behavior: 'smooth' })}>
                            Find My Seat
                        </button>
                        <button className="secondary-cta">View Schedules</button>
                    </motion.div>
                </div>
                <div className="floating-blob blob-1"></div>
                <div className="floating-blob blob-2"></div>
            </section>

            <section id="search" className="search-section-wrapper" ref={searchRef}>
                <motion.div className="search-container" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
                    <div className="search-header">
                        <div className="tab-pill">
                            <button className={activeSearchTab === 'oneWay' ? 'active' : ''} onClick={() => setActiveSearchTab('oneWay')}>One Way</button>
                            <button className={activeSearchTab === 'roundTrip' ? 'active' : ''} onClick={() => setActiveSearchTab('roundTrip')}>Round Trip</button>
                        </div>
                    </div>
                    <form className="search-grid">
                        <div className="input-group"><label>From</label><input type="text" placeholder="Origin" /></div>
                        <div className="input-group"><label>To</label><input type="text" placeholder="Destination" /></div>
                        <div className="input-group"><label>Date</label><input type="date" /></div>
                        <button type="submit" className="search-btn">Search Buses</button>
                    </form>
                </motion.div>
            </section>

            <section id="features" className="features-modern">
                <div className="section-header">
                    <h2>Powerful Booking Features</h2>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <motion.div key={i} className="feature-card-modern" whileHover={{ y: -10 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <div className="feature-icon-wrapper"><img src={f.icon} alt={f.title} /></div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section id="stats" className="stats-modern">
                <div className="stats-grid">
                    <AnimatedCounter endValue={120} label="Active Routes" />
                    <AnimatedCounter endValue={500} label="Luxury Buses" />
                    <AnimatedCounter endValue={15000} label="Monthly Travelers" />
                    <AnimatedCounter endValue={50} label="Cities Covered" />
                </div>
            </section>

            <footer className="footer-modern">
                <div className="footer-top">
                    <h2 className="text-logo">Get<span>Seat</span></h2>
                    <div className="footer-links">
                        <a href="#">Privacy</a> <a href="#">Terms</a> <a href="#">Help Center</a>
                        <a href="/AdminLoging" style={{ fontSize: "10px", color: "#aaa" }}>Admin Login</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 GetSeat Ticketing System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;