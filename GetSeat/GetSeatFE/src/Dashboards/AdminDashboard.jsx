import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MdAnalytics, MdDirectionsBus, MdRoute, MdEventSeat, 
    MdPeople,MdLogout, MdNotifications, MdTrendingUp,
    MdAdd, MdClose, MdDelete, MdCheckCircle, MdCancel
} from 'react-icons/md';
import { GiSteeringWheel } from "react-icons/gi";
import { useLocation } from 'react-router-dom';
import './AdminDashboard.css';

import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { signOut } from 'firebase/auth';
import { auth, databaseb } from "../firebase"; 


const AdminDashboard = () => {
    const location = useLocation();
    const currentAdminId = location.state?.adminId || null;

    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        { label: 'Total Bookings', value: '1,284', growth: '+12%', icon: <MdEventSeat /> },
        { label: 'Active Buses', value: '42', growth: '0%', icon: <MdDirectionsBus /> },
        { label: 'Today\'s Revenue', value: 'LKR 84,200', growth: '+5%', icon: <MdTrendingUp /> },
        { label: 'Pending Alerts', value: '7', growth: 'Critical', icon: <MdNotifications /> },
    ];

    const [schedules, setSchedules] = useState([]);

    const [buses, setBuses] = useState([]);
    

const loadBuses = async () => {
    const snap = await getDocs(collection(databaseb, "buses"));
    setBuses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

useEffect(() => { loadBuses(); }, []);

    const handleLogout = async () => {
            try {
                await signOut(auth);
                window.location.href = '/';
            } catch (err) {
                console.error('Logout failed:', err);
            }
        };

       
const loadSchedules = async () => {
  const snap = await getDocs(collection(databaseb, "schedules"));
  const scheduleList = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setSchedules(scheduleList);
};

useEffect(() => {
  loadSchedules();
}, []);

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h2>Get<span>Seat</span> <span>Admin</span></h2>
                </div>
                <nav className="admin-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <MdAnalytics /> Overview
                    </button>
                    <button className={activeTab === 'buses' ? 'active' : ''} onClick={() => setActiveTab('buses')}>
                        <MdDirectionsBus /> Manage Buses
                    </button>
                    <button className={activeTab === 'routes' ? 'active' : ''} onClick={() => setActiveTab('routes')}>
                        <MdRoute /> Routes & Schedules
                    </button>
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                        <MdEventSeat /> Bookings
                    </button>
                    <button className={activeTab === 'passengers' ? 'active' : ''} onClick={() => setActiveTab('passengers')}>
                        <MdPeople /> Passengers
                    </button>
                    <div className="nav-divider"></div>
                    <button className="logout-btn" onClick={handleLogout}>
    <MdLogout /> Logout
</button>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="search-bar">
                        <input type="text" placeholder="Search data..." />
                    </div>
                    <div className="admin-profile">
                        <div className="notification-bell"><MdNotifications /><span>3</span></div>
                        <div className="avatar">AD</div>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'overview' && (
                        <>
                            <div className="stats-grid">
                                {stats.map((stat, i) => (
                                    <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <div className="stat-icon">{stat.icon}</div>
                                        <div className="stat-info">
                                            <p>{stat.label}</p>
                                            <h3>{stat.value}</h3>
                                            <span className={stat.growth.includes('+') ? 'positive' : 'neutral'}>{stat.growth}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'routes' && <RoutesSchedulesView adminId={currentAdminId} buses={buses} />}
                    {activeTab === 'bookings' && <BookingsView />}
                    {activeTab === 'buses' && <ManageBusesView />}
                </div>
            </main>
        </div>
    );
};

const RoutesSchedulesView = ({ adminId, buses }) => {

    const [showAdd, setShowAdd] = useState(false);
    const [schedules, setSchedules] = useState([]);

    const [formData, setFormData] = useState({
    routeNo: '',
    departure: '',
    arrival: '',
    busModel: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    closingDate: '',
    closingTime: '',
    depot: '',
    price: '',
    stops: ''   // NEW
});

    // LOAD SCHEDULES
    const loadSchedules = async () => {
        try {
            const snap = await getDocs(collection(databaseb, "schedules"));
            const scheduleList = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSchedules(scheduleList);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    // ADD SCHEDULE
    const handleAdd = async (e) => {
        e.preventDefault();

        try {

            await addDoc(collection(databaseb, "schedules"), {
    routeNo: formData.routeNo,
    departure: formData.departure,
    arrival: formData.arrival,
    busModel: formData.busModel,
    busNumber: formData.busNumber, // <-- ADD THIS
    departureDate: formData.departureDate,
    departureTime: formData.departureTime,
    arrivalDate: formData.arrivalDate,
    arrivalTime: formData.arrivalTime,
    closingDate: formData.closingDate,
    closingTime: formData.closingTime,
    depot: formData.depot,
    price: formData.price,
    stops: formData.stops.split(',').map(s => s.trim()),
    createdBy: adminId,
    createdAt: Date.now()
});

            alert("Schedule Added Successfully");

            setShowAdd(false);

            setFormData({
                routeNo: '',
                departure: '',
                arrival: '',
                busModel: '',
                departureDate: '',
                departureTime: '',
                arrivalDate: '',
                arrivalTime: '',
                closingDate: '',
                closingTime: '',
                depot: '',
                price: ''
            });

            loadSchedules();

        } catch (error) {
            console.error(error);
            alert("Error adding schedule");
        }
    };

    // DELETE
    const handleDeleteSchedule = async (scheduleId) => {

        if (!window.confirm("Delete this schedule?")) return;

        try {

            await deleteDoc(doc(databaseb, "schedules", scheduleId));

            alert("Schedule deleted");

            loadSchedules();

        } catch (error) {
            console.error(error);
        }
    };

    return (

        <div className="view-wrapper">

            <div className="section-header">
                <div>
                    <h3>Routes & Schedules</h3>
                    <p>Manage bus timings and active routes</p>
                </div>

                <button
                    className="primary-btn add-btn"
                    onClick={() => setShowAdd(true)}
                >
                    <MdAdd /> Add Schedule
                </button>
            </div>

            {/* TABLE */}

            <div className="schedules-table">

                <h4>All Schedules</h4>

                <table className="admin-table">

                    <thead>
                        <tr>
                            <th>Route No</th>
                            <th>Departure</th>
                            <th>Arrival</th>
                            <th>Bus Number</th>
                            <th>Departure Date</th>
                            <th>Departure Time</th>
                            <th>Price</th>
                            <th>Depot</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {schedules.map((s) => (

                            <tr key={s.id}>
                                <td>{s.routeNo}</td>
                                <td>{s.departure}</td>
                                <td>{s.arrival}</td>
                                <td>{s.busNumber} ({s.busModel})</td>
                                <td>{s.departureDate}</td>
                                <td>{s.departureTime}</td>
                                <td>{s.price}</td>
                                <td>{s.depot}</td>

                                <td>
                                    <button
                                        className="icon-btn danger"
                                        onClick={() => handleDeleteSchedule(s.id)}
                                    >
                                        <MdDelete />
                                    </button>
                                </td>
                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>


            {/* ADD MODAL */}

            <AnimatePresence>

                {showAdd && (

                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >

                        <motion.div
                            className="modal-content glass-card"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                        >

                            <div className="modal-header">
                                <h4>Add Schedule</h4>
                                <MdClose
                                    className="close-icon"
                                    onClick={() => setShowAdd(false)}
                                />
                            </div>


                            <form className="admin-form" onSubmit={handleAdd}>

                                <div className="schedule-form-layout">

    {/* COMMON DETAILS */}
    <div className="common-section">

        <div className="input-field">
            <label>Route No</label>
            <input
                required
                value={formData.routeNo}
                onChange={(e) =>
                    setFormData({ ...formData, routeNo: e.target.value })
                }
            />
        </div>

        <div className="input-field">
           <select
    required
    value={formData.selectedBusId || ''}  // NEW: track selected bus ID
    onChange={(e) => {
        const selectedBus = buses.find(bus => bus.id === e.target.value);
        setFormData({ 
            ...formData, 
            selectedBusId: selectedBus?.id || '',
            busNumber: selectedBus?.busNumber || '',
            busModel: selectedBus?.model || ''
        });
    }}
>
    <option value="">Select Bus</option>
    {buses.map((bus) => (
        <option key={bus.id} value={bus.id}>
            {bus.busName} - {bus.busNumber} ({bus.model})
        </option>
    ))}
</select>
        </div>

        <div className="input-field">
            <label>Ticket Price</label>
            <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                }
            />
        </div>

        <div className="input-field">
            <label>Depot</label>
            <input
                value={formData.depot}
                onChange={(e) =>
                    setFormData({ ...formData, depot: e.target.value })
                }
            />
        </div>

        <div className="input-field full-width">
            <label>Stopping Halts</label>
            <input
                placeholder="Colombo, Kadawatha, Kegalle, Kandy"
                value={formData.stops}
                onChange={(e) =>
                    setFormData({ ...formData, stops: e.target.value })
                }
            />
        </div>

    </div>


    {/* DEPARTURE + ARRIVAL */}
    <div className="schedule-split">

        {/* DEPARTURE */}
        <div className="schedule-section">
            <h4>Departure</h4>

            <div className="input-field">
                <label>Departure Location</label>
                <input
                    value={formData.departure}
                    onChange={(e) =>
                        setFormData({ ...formData, departure: e.target.value })
                    }
                />
            </div>

            <div className="input-field">
                <label>Departure Date</label>
                <input
                    type="date"
                    onChange={(e) =>
                        setFormData({ ...formData, departureDate: e.target.value })
                    }
                />
            </div>

            <div className="input-field">
                <label>Departure Time</label>
                <input
                    type="time"
                    onChange={(e) =>
                        setFormData({ ...formData, departureTime: e.target.value })
                    }
                />
            </div>

        </div>


        {/* ARRIVAL */}
        <div className="schedule-section">
            <h4>Arrival</h4>

            <div className="input-field">
                <label>Arrival Location</label>
                <input
                    value={formData.arrival}
                    onChange={(e) =>
                        setFormData({ ...formData, arrival: e.target.value })
                    }
                />
            </div>

            <div className="input-field">
                <label>Arrival Date</label>
                <input
                    type="date"
                    onChange={(e) =>
                        setFormData({ ...formData, arrivalDate: e.target.value })
                    }
                />
            </div>

            <div className="input-field">
                <label>Arrival Time</label>
                <input
                    type="time"
                    onChange={(e) =>
                        setFormData({ ...formData, arrivalTime: e.target.value })
                    }
                />
            </div>

        </div>

    </div>


    {/* CLOSING SECTION */}
    <div className="closing-section">

        <div className="input-field">
            <label>Booking Closing Date</label>
            <input
                type="date"
                onChange={(e) =>
                    setFormData({ ...formData, closingDate: e.target.value })
                }
            />
        </div>

        <div className="input-field">
            <label>Closing Time</label>
            <input
                type="time"
                onChange={(e) =>
                    setFormData({ ...formData, closingTime: e.target.value })
                }
            />
        </div>

    </div>

</div>
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowAdd(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="primary-btn"
                                    >
                                        Save Schedule
                                    </button>
                                </div>

                            </form>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>

        </div>

    );
};

const BookingsView = () => {
    const [bookings, setBookings] = useState([]);

    const loadBookings = async () => {
        const snap = await getDocs(collection(databaseb, "bookings"));
        setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    useEffect(() => { loadBookings(); }, []);

    const updateStatus = async (id, status) => {
        await updateDoc(doc(databaseb, "bookings", id), { status });
        loadBookings();
    };

    return (
        <div className="data-card">
            <div className="card-header">
                <h3>Passenger Bookings</h3>
                <button className="secondary-btn" onClick={loadBookings}>Refresh Data</button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Passenger</th>
                        <th>Bus & Route</th>
                        <th>Seat</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b.id}>
                            <td>
                                <div className="passenger-cell">
                                    <div className="avatar-sm">{b.passengerName?.charAt(0)}</div>
                                    {b.passengerName}
                                </div>
                            </td>
                            <td>
                                <span className="route-text">{b.route}</span>
                                <small className="bus-subtext">{b.bus}</small>
                            </td>
                            <td><span className="seat-badge">{b.seat}</span></td>
                            <td>
                                <span className={`pill ${b.status?.toLowerCase()}`}>
                                    {b.status || 'Pending'}
                                </span>
                            </td>
                            <td className="action-cell">
                                <button className="icon-btn success" title="Confirm" onClick={() => updateStatus(b.id, "Reserved")}>
                                    <MdCheckCircle />
                                </button>
                                <button className="icon-btn danger" title="Cancel" onClick={() => updateStatus(b.id, "Cancelled")}>
                                    <MdCancel />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ManageBusesView = () => {
    const [buses, setBuses] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        busName: '',
        busNumber: '',
        busType: '',
        model: '',
        layoutType: '2x2',
        leftSeats: 2,
        rightSeats: 2,
        // Default standard Sri Lankan coach setup
        totalRows: 12, // Number of standard rows
        hasBackRow: true, // Toggle for the 8-seat combined row
    });

    const [seatGrid, setSeatGrid] = useState([]);

    // Load buses from Firestore
    const loadBuses = async () => {
        const snap = await getDocs(collection(databaseb, "buses"));
        const busList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBuses(busList);
    };

    useEffect(() => { loadBuses(); }, []);

    const handleDeleteBus = async (busId) => {
        if (!window.confirm("Are you sure you want to delete this bus?")) return;
        try {
            await deleteDoc(doc(databaseb, "buses", busId));
            alert("Bus deleted successfully!");
            loadBuses();
        } catch (err) {
            console.error(err);
            alert("Failed to delete bus");
        }
    };

    // GENERATE SEATS LOGIC (Updated for 8-seat back row)
    const generateSeats = () => {
        const { totalRows, leftSeats, rightSeats, hasBackRow } = formData;
        let seatNumber = 1;
        const grid = [];

        // 1. Generate standard rows
        for (let r = 0; r < totalRows; r++) {
            const rowSeats = { left: [], right: [] };

            // Fill Left Side Columns
            for (let i = 0; i < leftSeats; i++) {
                rowSeats.left.push({ number: seatNumber++, selected: true });
            }
            // Fill Right Side Columns
            for (let i = 0; i < rightSeats; i++) {
                rowSeats.right.push({ number: seatNumber++, selected: true });
            }
            grid.push({ type: 'standard', data: rowSeats });
        }

        // 2. Generate Combined Back Row (8 seats)
        if (hasBackRow) {
            const backRowSeats = [];
            for (let i = 0; i < 8; i++) {
                backRowSeats.push({ number: seatNumber++, selected: true });
            }
            grid.push({ type: 'backrow', data: backRowSeats });
        }

        return grid;
    };

    // Update grid whenever inputs change
    useEffect(() => {
        if (formData.totalRows > 0) {
            const grid = generateSeats();
            setSeatGrid(grid);
        }
    }, [formData.totalRows, formData.leftSeats, formData.rightSeats, formData.hasBackRow]);

    const handleAddBus = async (e) => {
        e.preventDefault();
        try {
            // Flatten seatGrid (handling different row types)
            const flatSeats = seatGrid.flatMap(row => {
                if (row.type === 'standard') {
                    return [...row.data.left, ...row.data.right].map(seat => seat.number);
                } else {
                    return row.data.map(seat => seat.number);
                }
            });

            await addDoc(collection(databaseb, "buses"), {
                busName: formData.busName,
                busNumber: formData.busNumber,
                busType: formData.busType,
                model: formData.model,
                totalSeats: flatSeats.length,
                layoutType: `${formData.leftSeats}x${formData.rightSeats}${formData.hasBackRow ? '+BackRow' : ''}`,
                seats: flatSeats,
                createdAt: Date.now()
            });

            alert("Bus added successfully!");
            setShowAdd(false);
            setFormData({ busName: '', busNumber: '', busType: '', model: '', totalRows: 12, layoutType: '2x2', leftSeats: 2, rightSeats: 2, hasBackRow: true });
            setSeatGrid([]);
            loadBuses();
        } catch (err) {
            console.error(err);
            alert("Failed to add bus");
        }
    };

    return (
        <div className="view-wrapper">
            <div className="section-header">
                <div>
                    <h3>Manage Buses</h3>
                    <p>Configure fleet details and seat arrangements</p>
                </div>
                <button className="primary-btn add-btn" onClick={() => setShowAdd(true)}>
                    <MdAdd /> Add New Bus
                </button>
            </div>

            <div className="data-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Bus Name</th>
                            <th>Number</th>
                            <th>Type</th>
                            <th>Model</th>
                            <th>Total Seats</th>
                            <th>Layout</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buses.map(bus => (
                            <tr key={bus.id}>
                                <td><strong>{bus.busName}</strong></td>
                                <td>{bus.busNumber}</td>
                                <td><span className={`pill ${bus.busType === 'AC' ? 'success' : 'warning'}`}>{bus.busType}</span></td>
                                <td>{bus.model}</td>
                                <td>{bus.totalSeats}</td>
                                <td>{bus.layoutType}</td>
                                <td>
                                    <button className="icon-btn danger" onClick={() => handleDeleteBus(bus.id)}>
                                        <MdDelete />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showAdd && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content glass-card bus-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <div className="modal-header">
                                <h4>Configure New Bus</h4>
                                <MdClose className="close-icon" onClick={() => setShowAdd(false)} />
                            </div>
                            
                            <form className="admin-form" onSubmit={handleAddBus}>
                                <div className="form-grid">
                                    <div className="input-field">
                                        <label>Bus Name</label>
                                        <input required value={formData.busName} onChange={(e) => setFormData({ ...formData, busName: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Bus Number</label>
                                        <input required value={formData.busNumber} placeholder="e.g. WP ND 1234" onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Bus Type</label>
                                        <select required value={formData.busType} onChange={(e) => setFormData({ ...formData, busType: e.target.value })}>
                                            <option value="">Select Type</option>
                                            <option value="Normal">Normal</option>
                                            <option value="AC">AC</option>
                                            <option value="Luxury">Luxury</option>
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Bus Model</label>
                                        <input required value={formData.model} placeholder="e.g. Leyland Viking" onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Standard Rows (excl. back)</label>
                                        <input type="number" required value={formData.totalRows} onChange={(e) => setFormData({ ...formData, totalRows: parseInt(e.target.value) })} />
                                    </div>
                                    
                                    <div className="input-field checkbox-field">
                                        <label>Has 8-Seat Back Row?</label>
                                        <input type="checkbox" checked={formData.hasBackRow} onChange={(e) => setFormData({ ...formData, hasBackRow: e.target.checked })} />
                                    </div>

                                    <div className="input-field">
                                        <label>Layout (Left x Right)</label>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <select value={formData.leftSeats} onChange={(e) => setFormData({ ...formData, leftSeats: parseInt(e.target.value) })}>
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={3}>3</option>
                                            </select>
                                            <span style={{ alignSelf: 'center' }}>x</span>
                                            <select value={formData.rightSeats} onChange={(e) => setFormData({ ...formData, rightSeats: parseInt(e.target.value) })}>
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={3}>3</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="input-field">
                                        <label>Approx. Total Seats</label>
                                        <p style={{ color: '#3b82f6', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {(formData.totalRows * (formData.leftSeats + formData.rightSeats)) + (formData.hasBackRow ? 8 : 0)}
                                        </p>
                                    </div>

                                    {/* ENHANCED BUS PREVIEW */}
                                    {/* ENHANCED BUS PREVIEW */}
<div className="seat-layout-preview full-width">
    <h5>Bus Interior Preview</h5>
    <div className="bus-container-outer">
        <div className="bus-chassis">
            {/* FRONT OF BUS (Left Side) */}
            <div className="bus-front-section">
                <div className="steering-column">
                    <div className="steering-wheel-icon">
                        <GiSteeringWheel /> {/* Using a steering wheel icon */}
                    </div>
                    <span className="driver-text">DRIVER</span>
                </div>
            </div>

            {/* SEAT CABIN */}
            <div className="bus-cabin">
    {seatGrid && seatGrid.length > 0 ? (
        seatGrid.map((row, rowIndex) => {
            if (row.type === 'standard') {
                return (
                    <div key={rowIndex} className="bus-column">
                        <div className="seat-group-top">
                            {/* Added safety check ?.map */}
                            {row.data?.left?.map(seat => (
                                <div key={seat.number} className={`ui-seat ${seat.number <= 7 ? 'filled' : ''}`}>
                                    <div className="seat-label">{seat.number.toString().padStart(2, '0')}</div>
                                    <div className="seat-handle"></div>
                                </div>
                            ))}
                        </div>
                        <div className="bus-aisle-horizontal"></div>
                        <div className="seat-group-bottom">
                            {row.data?.right?.map(seat => (
                                <div key={seat.number} className="ui-seat">
                                    <div className="seat-label">{seat.number.toString().padStart(2, '0')}</div>
                                    <div className="seat-handle"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div key={rowIndex} className="back-row-vertical">
                        {row.data?.map(seat => (
                            <div key={seat.number} className="ui-seat filled">
                                <div className="seat-label">{seat.number.toString().padStart(2, '0')}</div>
                                <div className="seat-handle"></div>
                            </div>
                        ))}
                    </div>
                );
            }
        })
    ) : (
        <div className="preview-placeholder">Adjust rows to see preview...</div>
    )}
</div>
        </div>
    </div>
</div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                                    <button type="submit" className="primary-btn">Save Bus Entry</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;