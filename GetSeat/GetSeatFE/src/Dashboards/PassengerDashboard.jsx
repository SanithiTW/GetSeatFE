// src/PassengerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MdSearch, MdBook, MdPerson, MdLogout, 
    MdEventSeat, MdCheckCircle 
} from 'react-icons/md';
import { auth, databaseb } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './PassengerDashboard.css';

   const PassengerDashboard = () => {
    const [activeTab, setActiveTab] = useState('search'); // search, bookings, profile
    const [bookingStep, setBookingStep] = useState(1); // 1: Search, 2: Seats, 3: Details, 4: Confirm
    const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // ✅ Move here

    const menuItems = [
        { id: 'search', label: 'Book a Ticket', icon: <MdSearch /> },
        { id: 'bookings', label: 'My Bookings', icon: <MdBook /> },
        { id: 'profile', label: 'My Profile', icon: <MdPerson /> },
    ];

    // --- Fetch Profile whenever My Profile tab is active ---
    useEffect(() => {
        const fetchProfile = async () => {
            if (activeTab !== 'profile') return;
            const user = auth.currentUser;
            if (!user) return;

            try {
                const docRef = doc(databaseb, 'passengers', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    setProfile({ fullName: '', email: '', phone: user.phoneNumber || '' });
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            }
        };
        fetchProfile();
    }, [activeTab]);

    // --- Save Updated Profile ---
    const handleSaveProfile = async () => {
        if (!profile.fullName || !profile.email) return alert('Please fill all fields.');
        const user = auth.currentUser;
        if (!user) return;

        try {
            setIsSavingProfile(true);
            const docRef = doc(databaseb, 'passengers', user.uid);
            await setDoc(docRef, {
                ...profile,
                phone: user.phoneNumber || profile.phone,
                updatedAt: Date.now()
            }, { merge: true });

            setIsSavingProfile(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error saving profile:', err);
            setIsSavingProfile(false);
            alert('Failed to save profile.');
        }
    };

    // --- Logout ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div className="dashboard-container">
            {/* --- SIDEBAR --- */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>Get<span>Seat</span></h2>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button 
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                setBookingStep(1);
                            }}
                        >
                            {item.icon} <span>{item.label}</span>
                        </button>
                    ))}
                    <button className="nav-item logout" onClick={handleLogout}>
                        <MdLogout /> <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="main-content">
                <header className="content-header">
                    <h1>{menuItems.find(i => i.id === activeTab)?.label}</h1>
                    <div className="user-badge">Welcome, {profile.fullName || 'Passenger'}</div>
                </header>

                <section className="view-container">
                    <AnimatePresence mode="wait">
                        {activeTab === 'search' && (
                            <motion.div 
                                key="search-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {bookingStep === 1 && <BusSearch onSearch={() => setBookingStep(2)} />}
                                {bookingStep === 2 && <SeatLayout onProceed={() => setBookingStep(3)} />}
                                {bookingStep === 3 && <PassengerDetails onConfirm={() => setBookingStep(4)} />}
                                {bookingStep === 4 && <BookingSuccess onDone={() => setActiveTab('bookings')} />}
                            </motion.div>
                        )}

                        {activeTab === 'bookings' && <MyBookingsView />}

                        const [isEditing, setIsEditing] = useState(false);

// ... inside the return AnimatePresence ...
{activeTab === 'profile' && (
    <motion.div
        key="profile-view"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="profile-section"
    >
        <div className="glass-card profile-card">
            <div className="profile-card-header">
                <div className="avatar-large">
                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="header-info">
                    <h3>{isEditing ? "Edit Your Information" : profile.fullName || "Passenger"}</h3>
                    <p>{isEditing ? "Update your contact details below" : "Passenger Account"}</p>
                </div>
  
                    {!isEditing && (
    <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>
        Edit Profile
    </button>
)}

            </div>

            <div className="profile-details">
                <div className="detail-row">
                    <label>Full Name</label>
                    {isEditing ? (
                        <input 
                            type="text" 
                            className="edit-input"
                            value={profile.fullName} 
                            onChange={(e) => setProfile({...profile, fullName: e.target.value})} 
                        />
                    ) : (
                        <p className="detail-value">{profile.fullName || "Not set"}</p>
                    )}
                </div>

                <div className="detail-row">
                    <label>Email Address</label>
                    {isEditing ? (
                        <input 
                            type="email" 
                            className="edit-input"
                            value={profile.email} 
                            onChange={(e) => setProfile({...profile, email: e.target.value})} 
                        />
                    ) : (
                        <p className="detail-value">{profile.email || "Not set"}</p>
                    )}
                </div>

                <div className="detail-row">
                    <label>Phone Number</label>
                    <p className="detail-value verified">{profile.phone} <span>(Verified)</span></p>
                </div>
            </div>

            {isEditing && (
                <div className="profile-actions">
        <button className="secondary-btn" onClick={() => setIsEditing(false)}>Cancel</button>
        <button 
            className="primary-btn save-btn" 
            onClick={async () => {
                await handleSaveProfile();
                setIsEditing(false);
            }} 
            disabled={isSavingProfile}
        >
            {isSavingProfile ? 'Saving...' : 'Save Changes'}
        </button>
    </div>
            )}
        </div>
    </motion.div>
)}
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
};

// ----------------- Sub-components -----------------
const BusSearch = ({ onSearch }) => (
    <div className="glass-card search-box">
        <h3>Find Available Buses</h3>
        <div className="search-inputs">
            <div className="input-group">
                <label>From</label>
                <select><option>Colombo</option><option>Kandy</option></select>
            </div>
            <div className="input-group">
                <label>To</label>
                <select><option>Kandy</option><option>Colombo</option></select>
            </div>
            <div className="input-group">
                <label>Date</label>
                <input type="date" />
            </div>
            <button className="primary-btn" onClick={onSearch}>Search Buses</button>
        </div>
    </div>
);

const SeatLayout = ({ onProceed }) => {
    const seats = Array.from({ length: 20 }, (_, i) => i + 1);
    const booked = [3, 4, 12, 13];
    const [selected, setSelected] = useState([]);

    return (
        <div className="glass-card">
            <h3>Select Your Seats</h3>
            <div className="seat-grid">
                {seats.map(s => (
                    <button 
                        key={s}
                        disabled={booked.includes(s)}
                        className={`seat ${booked.includes(s) ? 'booked' : ''} ${selected.includes(s) ? 'selected' : ''}`}
                        onClick={() => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    >
                        <MdEventSeat /> {s}
                    </button>
                ))}
            </div>
            <div className="legend">
                <span><div className="box available"></div> Available</span>
                <span><div className="box booked"></div> Booked</span>
                <span><div className="box selected"></div> Selected</span>
            </div>
            <button className="primary-btn" disabled={selected.length === 0} onClick={onProceed}>Proceed to Checkout</button>
        </div>
    );
};

const BookingSuccess = ({ onDone }) => (
    <div className="glass-card success-card">
        <MdCheckCircle className="success-icon" />
        <h2>Booking Confirmed!</h2>
        <p>Your Booking ID: <strong>BK-10245</strong></p>
        <button className="primary-btn" onClick={onDone}>View My Bookings</button>
    </div>
);

const MyBookingsView = () => (
    <div className="glass-card">
        <table className="bookings-table">
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>BK-9945</td>
                    <td>Colombo → Galle</td>
                    <td>2026-05-10</td>
                    <td><span className="status-pill confirmed">Confirmed</span></td>
                </tr>
            </tbody>
        </table>
    </div>
);

export default PassengerDashboard;