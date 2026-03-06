import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MdAnalytics, MdDirectionsBus, MdRoute, MdEventSeat, 
    MdPeople,MdLogout, MdNotifications, MdTrendingUp,
    MdAdd, MdClose, MdDelete, MdCheckCircle, MdCancel
} from 'react-icons/md';
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
    const [schedules, setSchedules] = useState([]); // move schedules here

    // Split route into from and to
    const [formData, setFormData] = useState({ 
        from: '', 
        to: '', 
        bus: '', 
        date: '', 
        time: '' 
    });

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

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const finalRoute = `${formData.from} → ${formData.to}`;
            await addDoc(collection(databaseb, "schedules"), {
                route: finalRoute,
                bus: formData.bus,
                date: formData.date,
                time: formData.time,
                createdAt: Date.now(),
                createdBy: adminId   // ✅ save the logged-in admin ID
            });

            alert("Schedule successfully added!");
            setShowAdd(false);
            setFormData({ from: '', to: '', bus: '', date: '', time: '' });
            loadSchedules(); // reload schedules
        } catch (error) {
            console.error(error);
            alert("Error adding schedule");
        }
    };

   const handleDeleteSchedule = async (scheduleId) => {
  if (!window.confirm("Are you sure you want to delete this schedule?")) return;

  try {
    await deleteDoc(doc(databaseb, "schedules", scheduleId));
    alert("Schedule deleted successfully!");
    loadSchedules(); // refresh list
  } catch (err) {
    console.error(err);
    alert("Failed to delete schedule");
  }
};

    return (
        <div className="view-wrapper">
            <div className="section-header">
                <div>
                    <h3>Routes & Schedules</h3>
                    <p>Manage bus timings and active routes</p>
                </div>
                <button className="primary-btn add-btn" onClick={() => setShowAdd(true)}>
                    <MdAdd /> Add New Schedule
                </button>

                <div className="schedules-table">
  <h4>All Schedules</h4>
  <table className="admin-table">
    <thead>
      <tr>
        <th>Route</th>
        <th>Bus</th>
        <th>Date</th>
        <th>Time</th>
        <th>Created By</th>
        
      </tr>
    </thead>
    <tbody>
  {schedules.map((s) => (
    <tr key={s.id}>
      <td>{s.route}</td>
      <td>{s.bus}</td>
      <td>{s.date}</td>
      <td>{s.time}</td>
      <td>{s.createdBy}</td>
      <td>
        <button className="icon-btn danger" title="Delete Schedule" onClick={() => handleDeleteSchedule(s.id)}>
          <MdDelete />
        </button>
      </td>
    </tr>
  ))}
</tbody>
  </table>
</div>
            </div>

            

            <AnimatePresence>
                {showAdd && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content glass-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <div className="modal-header">
                                <h4>New Schedule</h4>
                                <MdClose className="close-icon" onClick={() => setShowAdd(false)} />
                            </div>
                            <form className="admin-form" onSubmit={handleAdd}>
                                <div className="form-grid">
                                    {/* --- SPLIT ROUTE INPUTS --- */}
                                    <div className="input-field">
                                        <label>From (Source)</label>
                                        <input 
                                            placeholder="e.g. Colombo" 
                                            required 
                                            value={formData.from}
                                            onChange={(e) => setFormData({...formData, from: e.target.value})} 
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>To (Destination)</label>
                                        <input 
                                            placeholder="e.g. Kandy" 
                                            required 
                                            value={formData.to}
                                            onChange={(e) => setFormData({...formData, to: e.target.value})} 
                                        />
                                    </div>
                                    {/* ------------------------- */}
                                    <div className="input-field">
    <label>Select Bus</label>
    <select required value={formData.bus} onChange={(e) => setFormData({...formData, bus: e.target.value})}>
        <option value="">Select Bus</option>
        {buses.map(bus => (
            <option key={bus.id} value={bus.busName}>{bus.busName} ({bus.busNumber})</option>
        ))}
    </select>
</div>
                                    <div className="input-field">
                                        <label>Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                        />
                                    </div>
                                    <div className="input-field full-width">
                                        <label>Departure Time</label>
                                        <input 
                                            type="time" 
                                            required 
                                            onChange={(e) => setFormData({...formData, time: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                                    <button type="submit" className="primary-btn">Save Schedule</button>
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
    totalSeats: 0,
    layoutType: '2x2', // 2+2 left/right default
    leftSeats: 2,
    rightSeats: 2
  });

  const [seatGrid, setSeatGrid] = useState([]);

  // Load buses from Firestore
  const loadBuses = async () => {
    const snap = await getDocs(collection(databaseb, "buses"));
    const busList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBuses(busList);
  };

  const handleDeleteBus = async (busId) => {
  if (!window.confirm("Are you sure you want to delete this bus?")) return;

  try {
    await deleteDoc(doc(databaseb, "buses", busId));
    alert("Bus deleted successfully!");
    loadBuses(); // refresh list
  } catch (err) {
    console.error(err);
    alert("Failed to delete bus");
  }
};
  useEffect(() => { loadBuses(); }, []);

  // Generate seats based on layout
  useEffect(() => {
    if (formData.totalSeats > 0) {
      const grid = generateSeats(formData.totalSeats, formData.leftSeats, formData.rightSeats);
      setSeatGrid(grid);
    }
  }, [formData.totalSeats, formData.leftSeats, formData.rightSeats]);

  const generateSeats = (totalSeats, leftCount, rightCount) => {
    const rows = Math.ceil(totalSeats / (leftCount + rightCount));
    let seatNumber = 1;
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const rowSeats = { left: [], right: [] };

      for (let i = 0; i < leftCount; i++) {
        if (seatNumber <= totalSeats) {
          rowSeats.left.push({ number: seatNumber++, selected: true });
        }
      }
      for (let i = 0; i < rightCount; i++) {
        if (seatNumber <= totalSeats) {
          rowSeats.right.push({ number: seatNumber++, selected: true });
        }
      }
      grid.push(rowSeats);
    }
    return grid;
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      // Flatten seatGrid
      const flatSeats = seatGrid.flatMap(row => [...row.left, ...row.right].map(seat => seat.number));

      await addDoc(collection(databaseb, "buses"), {
        busName: formData.busName,
        busNumber: formData.busNumber,
        busType: formData.busType,
        totalSeats: formData.totalSeats,
        layoutType: `${formData.leftSeats}x${formData.rightSeats}`,
        seats: flatSeats
      });

      alert("Bus added successfully!");
      setShowAdd(false);
      setFormData({ busName: '', busNumber: '', busType: '', totalSeats: 0, layoutType: '2x2', leftSeats: 2, rightSeats: 2 });
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
        <h3>Manage Buses</h3>
        <button className="primary-btn add-btn" onClick={() => setShowAdd(true)}>
          <MdAdd /> Add New Bus
        </button>
      </div>

      <div className="buses-table">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Bus Name</th>
              <th>Bus Number</th>
              <th>Bus Type</th>
              <th>Total Seats</th>
              <th>Layout</th>
            </tr>
          </thead>
          <tbody>
            {buses.map(bus => (
              <tr key={bus.id}>
                <td>{bus.busName}</td>
                <td>{bus.busNumber}</td>
                <td>{bus.busType}</td>
                <td>{bus.totalSeats}</td>
                <td>{bus.layoutType}</td>
                <td>
        <button className="icon-btn danger" title="Delete Bus" onClick={() => handleDeleteBus(bus.id)}>
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
            <motion.div className="modal-content glass-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <div className="modal-header">
                <h4>New Bus</h4>
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
                    <input required value={formData.busNumber} onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })} />
                  </div>
                  <div className="input-field">
                    <label>Bus Type</label>
                    <input required value={formData.busType} onChange={(e) => setFormData({ ...formData, busType: e.target.value })} />
                  </div>
                  <div className="input-field">
                    <label>Total Seats</label>
                    <input
                      type="number"
                      required
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="input-field">
                    <label>Left Side Seats</label>
                    <select value={formData.leftSeats} onChange={(e) => setFormData({ ...formData, leftSeats: parseInt(e.target.value) })}>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                  <div className="input-field">
                    <label>Right Side Seats</label>
                    <select value={formData.rightSeats} onChange={(e) => setFormData({ ...formData, rightSeats: parseInt(e.target.value) })}>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>

                  <div className="seat-layout-preview full-width">
                    <h5>Bus Seat Layout Preview (Front at top)</h5>
                    <div className="bus-seats">
  {seatGrid.map((row, rowIndex) => (
    <div key={rowIndex} className="seat-row horizontal">
      <div className="seat-side left">
        {row.left.map(seat => (
          <div key={seat.number} className={`seat ${seat.selected ? 'active' : 'inactive'}`}>
            {seat.number}
          </div>
        ))}
      </div>
      <div className="aisle"></div>
      <div className="seat-side right">
        {row.right.map(seat => (
          <div key={seat.number} className={`seat ${seat.selected ? 'active' : 'inactive'}`}>
            {seat.number}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Save Bus</button>
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