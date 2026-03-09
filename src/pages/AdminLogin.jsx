import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdEmail, MdLock, MdAdminPanelSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { auth, databaseb } from '../firebase'; // Firebase config
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
  setIsLoading(true);

  // 1️⃣ Firebase Authentication
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2️⃣ Verify admin role in Firestore
  const adminDoc = await getDoc(doc(databaseb, 'admin', user.uid));
  if (!adminDoc.exists()) {
    setError('Access denied: You are not an admin');
    await auth.signOut();
    setIsLoading(false);
    return;
  }

  // ✅ Skip backend fetch for now
  setIsLoading(false);
  navigate('/AdminDashboard', { state: { adminId: user.uid } });

} catch (firebaseError) {
  console.error(firebaseError);
  setError(firebaseError.message || 'Login failed');
  setIsLoading(false);
}
  };

  return (
    <div className="admin-login-container">
      <div className="mesh-background"></div>
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <MdAdminPanelSettings size={40} className="admin-icon" />
          <h1>Admin Portal</h1>
          <p>Secure access for GetSeat Management</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <MdEmail className="icon" />
              <input 
                type="email"
                placeholder="admin@getseat.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <MdLock className="icon" />
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-msg">{error}</motion.p>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <div className="loader-content">
                <div className="spinner-small"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Login to Dashboard"
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">Back to Landing Page</a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;