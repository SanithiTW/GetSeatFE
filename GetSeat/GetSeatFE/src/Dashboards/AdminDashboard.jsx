import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    MdAnalytics, MdDirectionsBus, MdRoute, MdEventSeat, 
    MdPeople, MdSettings, MdNotifications, MdTrendingUp 
} from 'react-icons/md';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        { label: 'Total Bookings', value: '1,284', growth: '+12%', icon: <MdEventSeat /> },
        { label: 'Active Buses', value: '42', growth: '0%', icon: <MdDirectionsBus /> },
        { label: 'Today\'s Revenue', value: 'LKR 84,200', growth: '+5%', icon: <MdTrendingUp /> },
        { label: 'Pending Alerts', value: '7', growth: 'Critical', icon: <MdNotifications /> },
    ];

    return (
        <div className="admin-container">
            {/* --- ADMIN SIDEBAR --- */}
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
                    <button className={activeTab === 'passengers' ? 'active' : ''} onClick={() => setActiveTab('passengers')}>
                        <MdPeople /> Passengers
                    </button>
                    <div className="nav-divider"></div>
                    <button><MdSettings /> Settings</button>
                </nav>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="search-bar">
                        <input type="text" placeholder="Search Booking ID or Bus No..." />
                    </div>
                    <div className="admin-profile">
                        <div className="notification-bell"><MdNotifications /><span>3</span></div>
                        <div className="avatar">AD</div>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="stats-grid">
                                {stats.map((stat, i) => (
                                    <motion.div 
                                        key={i} className="stat-card"
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="stat-icon">{stat.icon}</div>
                                        <div className="stat-info">
                                            <p>{stat.label}</p>
                                            <h3>{stat.value}</h3>
                                            <span className={stat.growth.includes('+') ? 'positive' : 'neutral'}>{stat.growth}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Recent Bookings Table */}
                            <div className="data-card">
                                <div className="card-header">
                                    <h3>Recent Bookings</h3>
                                    <button className="view-all">Export Report (CSV)</button>
                                </div>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Booking ID</th>
                                            <th>Passenger</th>
                                            <th>Bus / Route</th>
                                            <th>Seat</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>#BK-1025</td>
                                            <td>Arun Perera</td>
                                            <td>EX-01 (Col - Kandy)</td>
                                            <td>A1, A2</td>
                                            <td><span className="pill success">Confirmed</span></td>
                                            <td><button className="btn-edit">Edit</button></td>
                                        </tr>
                                        <tr>
                                            <td>#BK-1024</td>
                                            <td>Saman Kumara</td>
                                            <td>EX-05 (Col - Galle)</td>
                                            <td>B4</td>
                                            <td><span className="pill warning">Pending</span></td>
                                            <td><button className="btn-edit">Edit</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'buses' && <BusManagementView />}
                </div>
            </main>
        </div>
    );
};

// Sub-component for Bus Management
const BusManagementView = () => (
    <div className="data-card">
        <div className="card-header">
            <h3>Active Fleet</h3>
            <button className="primary-btn">+ Add New Bus</button>
        </div>
        <div className="bus-grid">
            {/* Simplified Bus Card */}
            <div className="bus-mini-card">
                <MdDirectionsBus size={30} />
                <div>
                    <h4>Express Line 01</h4>
                    <p>49 Seats | Super Luxury</p>
                </div>
                <div className="status-indicator online">Active</div>
            </div>
        </div>
    </div>
);

export default AdminDashboard;