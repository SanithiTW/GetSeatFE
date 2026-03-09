// src/PassengerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MdSearch, MdBook, MdPerson, MdLogout, 
    MdEventSeat, MdCheckCircle 
} from 'react-icons/md';
import { GiSteeringWheel } from "react-icons/gi"; // Add this import
import { auth, databaseb } from '../firebase';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import './PassengerDashboard.css';

import axios from "axios";

const PassengerDashboard = () => {
    const [activeTab, setActiveTab] = useState('search'); 
    const [bookingStep, setBookingStep] = useState(1); 
    const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [fromOptions, setFromOptions] = useState([]);
    const [toOptions, setToOptions] = useState([]);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [availableBuses, setAvailableBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);

    const [selectedSeats, setSelectedSeats] = useState([]);

    const [boarding, setBoarding] = useState('');
const [dropping, setDropping] = useState('');

const [bookedSeats, setBookedSeats] = useState([]);



    const menuItems = [
        { id: 'search', label: 'Book a Seat', icon: <MdSearch /> },
        { id: 'bookings', label: 'My Bookings', icon: <MdBook /> },
        { id: 'profile', label: 'My Profile', icon: <MdPerson /> },
    ];

    




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

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const schedulesCol = collection(databaseb, 'schedules');
                const schedulesSnap = await getDocs(schedulesCol);
                const fromSet = new Set();
                const toSet = new Set();

                schedulesSnap.forEach(doc => {
                    const sch = doc.data();
                    if (sch.departure?.trim()) fromSet.add(sch.departure.trim());
                    if (sch.arrival?.trim()) toSet.add(sch.arrival.trim());
                });

                setFromOptions(Array.from(fromSet));
                setToOptions(Array.from(toSet));
            } catch (err) {
                console.error('Error fetching locations:', err);
            }
        };
        fetchLocations();
    }, []);

    // Fetch booked seats for the selected bus
useEffect(() => {
  const fetchBookings = async () => {
    if (!selectedBus) return;

    try {
      const bookingsRef = collection(databaseb, "bookings");
      const q = query(
  bookingsRef,
  where("scheduleId","==",selectedBus.scheduleId),
  where("status","in",["paid","reserved"])
);
      const snap = await getDocs(q);

      const seats = [];

snap.forEach(doc => {
  const data = doc.data();
  if (data.seats) {
    data.seats.forEach(s => seats.push(Number(s)));
  }
});

setBookedSeats(seats);
    } catch (err) {
      console.error("Error fetching booked seats:", err);
    }
  };

  fetchBookings();
}, [selectedBus]);


    const handleSearchBuses = async () => {
    if (!from || !to || !date) return alert('Please select From, To, and Date.');
    try {
        const schedulesCol = collection(databaseb, 'schedules');
        const schedulesSnap = await getDocs(schedulesCol);
        const busesCol = collection(databaseb, 'buses');
        const busesSnap = await getDocs(busesCol);

        const busesMap = {};
        busesSnap.forEach(bDoc => {
            const data = bDoc.data();
            busesMap[data.busNumber] = { id: bDoc.id, ...data };
        });

        const results = [];

        schedulesSnap.forEach(docSnap => {
            const sch = docSnap.data();
            if (
                sch.departure?.trim() === from.trim() &&
                sch.arrival?.trim() === to.trim() &&
                sch.departureDate?.trim() === date
            ) {
                const busData = busesMap[sch.busNumber] || { seats: [] };
                results.push({ scheduleId: docSnap.id, schedule: sch, bus: busData });
            }
        });

        setAvailableBuses(results);
        if (results.length === 0) alert('No buses found for the selected route and date.');
    } catch (err) {
        console.error('Error searching buses:', err);
        alert('Error searching buses.');
    }
};

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
                                {bookingStep === 1 && (
                                    <BusSearch 
                                        from={from} setFrom={setFrom} 
                                        to={to} setTo={setTo} 
                                        date={date} setDate={setDate}
                                        fromOptions={fromOptions} toOptions={toOptions}
                                        handleSearchBuses={handleSearchBuses}
                                        availableBuses={availableBuses}
                                        setSelectedBus={bus => {
                                            setSelectedBus(bus);
                                            setBookingStep(2);
                                        }}
                                    />
                                )}
{bookingStep === 2 && selectedBus && (
  <SeatLayout
    bus={selectedBus.bus}
    selectedSeats={selectedSeats}
    bookedSeats={bookedSeats} // <- now correct
    toggleSeat={(seatNo) => {
        setSelectedSeats(prev => 
            prev.includes(seatNo) 
            ? prev.filter(s => s !== seatNo)
            : [...prev, seatNo]
        );
    }}
    onProceed={() => setBookingStep(3)}
  />
)}
                                {bookingStep === 3 && selectedBus && (
    <BoardingDropping
        schedule={selectedBus.schedule}
        onConfirm={(boardingPoint, droppingPoint) => {
            setBoarding(boardingPoint);
            setDropping(droppingPoint);
            setBookingStep(4);
        }}
    />
)}

{bookingStep === 4 && selectedBus && (
    <PaymentSection
        schedule={selectedBus.schedule}
        scheduleId={selectedBus.scheduleId}
        selectedSeats={selectedSeats}
        boarding={boarding}
        dropping={dropping}
        onSuccess={() => setBookingStep(5)}
    />
)}
{bookingStep === 5 && (
    <BookingSuccess onDone={() => setActiveTab("bookings")} />
)}

                                
                            </motion.div>
                        )}

                        {activeTab === 'bookings' && <MyBookingsView />}

                        {activeTab === 'profile' && (
                            <ProfileSection 
                                profile={profile} 
                                isEditing={isEditing} 
                                setIsEditing={setIsEditing} 
                                setProfile={setProfile} 
                                handleSaveProfile={handleSaveProfile} 
                                isSavingProfile={isSavingProfile}
                            />
                        )}
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
};

// ----------------- Sub-components -----------------

const BusSearch = ({ from, setFrom, to, setTo, date, setDate, fromOptions, toOptions, handleSearchBuses, availableBuses, setSelectedBus }) => (
    <div className="glass-card search-box">
        <h3>Find Available Buses</h3>
        <div className="search-inputs">
            <div className="input-group">
                <label>From</label>
                <select value={from} onChange={e => setFrom(e.target.value)}>
                    <option value="">Select</option>
                    {fromOptions.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
                </select>
            </div>
            <div className="input-group">
                <label>To</label>
                <select value={to} onChange={e => setTo(e.target.value)}>
                    <option value="">Select</option>
                    {toOptions.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
                </select>
            </div>
            <div className="input-group">
                <label>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <button className="primary-btn" onClick={handleSearchBuses}>Search Buses</button>
        </div>

        {availableBuses.length > 0 && (
            <div className="bus-results">
                {availableBuses.map((item, idx) => (
                    <div key={idx} className="bus-card">
                        <div className="bus-card-info">
                            <h4>{item.bus.busName}</h4>
                            <span className="route-tag">Route {item.schedule.routeNo}</span>
                            <p>{item.schedule.departure} ({item.schedule.departureTime}) → {item.schedule.arrival} ({item.schedule.arrivalTime})</p>
                            <p className="price-tag">LKR {item.schedule.price}</p>
                        </div>
                        <button className="book-btn" onClick={() => setSelectedBus(item)}>
                            View Seats
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const SeatLayout = ({ bus, selectedSeats, bookedSeats, toggleSeat, onProceed }) => {

    if (!bus || !bus.seats) return <div>Loading seats...</div>;

    const seats = bus.seats.map(s => Number(s));

    // extract layout numbers
    let leftSeats = 2;
    let rightSeats = 2;
    let hasBackRow = false;

    if (bus.layoutType) {
        const layout = bus.layoutType.split("+")[0];
        const parts = layout.split("x");
        leftSeats = parseInt(parts[0]);
        rightSeats = parseInt(parts[1]);
        hasBackRow = bus.layoutType.includes("BackRow");
    }

    const seatsPerRow = leftSeats + rightSeats;

    let standardSeats = seats;
    let backRowSeats = [];

    if (hasBackRow) {
        backRowSeats = seats.slice(-8);
        standardSeats = seats.slice(0, seats.length - 8);
    }

    const rows = [];

    for (let i = 0; i < standardSeats.length; i += seatsPerRow) {
        rows.push(standardSeats.slice(i, i + seatsPerRow));
    }

    return (
        <div className="bus-container">

            <div className="bus-front">DRIVER</div>

            {rows.map((row, idx) => (

                <div key={idx} className="seat-row">

                    <div className="seat-pair">
                        {row.slice(0, leftSeats).map(seatNo => {

                            const isBooked = bookedSeats.includes(seatNo);
                            const isSelected = selectedSeats.includes(seatNo);

                            return (
                                <div
                                    key={seatNo}
                                    className={`seat ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => !isBooked && toggleSeat(seatNo)}
                                >
                                    {seatNo.toString().padStart(2, '0')}
                                </div>
                            );
                        })}
                    </div>

                    <div className="aisle"></div>

                    <div className="seat-pair">
                        {row.slice(leftSeats).map(seatNo => {

                            const isBooked = bookedSeats.includes(seatNo);
                            const isSelected = selectedSeats.includes(seatNo);

                            return (
                                <div
                                    key={seatNo}
                                    className={`seat ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => !isBooked && toggleSeat(seatNo)}
                                >
                                    {seatNo.toString().padStart(2, '0')}
                                </div>
                            );
                        })}
                    </div>

                </div>

            ))}

            {/* BACK ROW */}
            {hasBackRow && backRowSeats.length > 0 && (
                <div className="back-row">

                    {backRowSeats.map(seatNo => {

                        const isBooked = bookedSeats.includes(seatNo);
                        const isSelected = selectedSeats.includes(seatNo);

                        return (
                            <div
                                key={seatNo}
                                className={`seat ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                                onClick={() => !isBooked && toggleSeat(seatNo)}
                            >
                                {seatNo.toString().padStart(2, '0')}
                            </div>
                        );
                    })}

                </div>
            )}

            {selectedSeats.length > 0 && (
                <button
                    className="primary-btn"
                    style={{ marginTop: "20px", width: "100%" }}
                    onClick={onProceed}
                >
                    Proceed to Boarding & Dropping
                </button>
            )}

        </div>
    );
};




const MyBookingsView = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const bookingsRef = collection(databaseb, "bookings");
        const q = query(bookingsRef, where("userId", "==", user.uid));
        const snap = await getDocs(q);

        const data = [];
        snap.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });

        data.sort((a, b) => b.createdAt - a.createdAt);

        setBookings(data);
      } catch (err) {
        console.error("Error loading bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p>Loading your bookings...</p>;
  if (bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div className="glass-card">
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Seats</th>
            <th>Boarding → Dropping</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>

              <td>
                {booking.seats
                  ?.map((s) => s.toString().padStart(2, "0"))
                  .join(", ")}
              </td>

              <td>
                {booking.boarding} → {booking.dropping}
              </td>

              <td>LKR {booking.amount}</td>

              <td>
                <span
                  className={`status-pill ${
                    booking.status === "paid" ? "confirmed" : "pending"
                  }`}
                >
                  {booking.status === "paid" ? "Confirmed" : booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProfileSection = ({ profile, isEditing, setIsEditing, setProfile, handleSaveProfile, isSavingProfile }) => (
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
);

const PaymentSection = ({ schedule, scheduleId, selectedSeats, boarding, dropping, onSuccess }) => {

   const handlePayment = async () => {

    const user = auth.currentUser;
    if (!user) return alert("User not logged in");

    const orderId = "ORD-" + Date.now();
    const amount = (schedule.price * selectedSeats.length).toFixed(2);

    try {

        // Request hash from Spring Boot backend
        const res = await axios.post("http://localhost:8080/api/payment/hash", {
    order_id: orderId,
    amount: amount,
    currency: "LKR"
});
const hash = res.data.hash;

        const payment = {
    sandbox: true,
    merchant_id: "1234122", // From your account
    return_url: "https://yourdomain.com/payment-success",
    cancel_url: "https://yourdomain.com/payment-cancel",
    notify_url: "https://yourdomain.com/api/payhere/notify",
    order_id: orderId,
    items: "Bus Seat Booking",
    amount: amount,
    currency: "LKR",
    hash: hash, // from backend
    first_name: user.displayName || "Passenger",
    last_name: "",
    email: user.email,
    phone: user.phoneNumber || "0770000000",
    address: "Colombo",
    city: "Colombo",
    country: "Sri Lanka",
    custom_1: user.uid,
    custom_2: JSON.stringify(selectedSeats)
};

        window.payhere.startPayment(payment);

        window.payhere.onCompleted = async function (orderId) {

            const bookingId = "BK-" + Date.now();

            await setDoc(doc(databaseb, "bookings", bookingId), {
    passengerId: user.uid,
    orderId: orderId,
    seats: selectedSeats,
    boarding: boarding,
    dropping: dropping,
    scheduleId: scheduleId,   // ✅ Firestore document ID
    amount: amount,
    status: "paid",
    createdAt: Date.now()
});

            onSuccess();
        };

        window.payhere.onDismissed = function () {
            alert("Payment cancelled");
        };

        window.payhere.onError = function (error) {
            console.log(error);
            alert("Payment error");
        };

    } catch (error) {
        console.error("Payment error:", error);
        alert("Payment initialization failed");
    }
};

    return (
        <div className="glass-card">
            <h3>Payment</h3>

            <p>Seats: {selectedSeats.join(", ")}</p>
            <p>Boarding: {boarding}</p>
            <p>Dropping: {dropping}</p>
            <p>Total: LKR {schedule.price * selectedSeats.length}</p>

            <button className="primary-btn" onClick={handlePayment}>
                Pay with PayHere
            </button>
        </div>
    );
};



export default PassengerDashboard;