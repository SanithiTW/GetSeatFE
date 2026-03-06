import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MdPerson, MdEmail, MdPhone, MdVerifiedUser } from "react-icons/md";
import { doc, setDoc } from "firebase/firestore";
import { databaseb } from "../firebase"; 
import "./ProfileSetup.css";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uid, phone } = location.state || {};

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email) {
      setError("Please fill in all fields to continue.");
      return;
    }

    try {
      setIsSaving(true);
      const userRef = doc(databaseb, "passengers", uid);
      await setDoc(userRef, {
        phone,
        fullName,
        email,
        createdAt: Date.now(),
        role: "passenger"
      });

      setIsSaving(false);
      navigate("/PassengerDashboard");
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      setError("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="mesh-background"></div>

      <motion.div 
        className="profile-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="profile-header">
          <div className="setup-icon">
            <MdVerifiedUser size={48} />
          </div>
          <h2>Complete Your Profile</h2>
          <p>Just a few more details to get you moving</p>
        </div>

        <form onSubmit={handleSaveProfile} className="profile-form">
          {/* Read-only Phone Field (to show they are verified) */}
          <div className="input-group">
            <label>Verified Phone</label>
            <div className="input-wrapper disabled">
              <MdPhone className="icon" />
              <input type="text" value={phone || ""} disabled />
            </div>
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <MdPerson className="icon" />
              <input 
                type="text" 
                placeholder="John Doe"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <MdEmail className="icon" />
              <input 
                type="email" 
                placeholder="john@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isSaving}
              />
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="save-btn" disabled={isSaving}>
            {isSaving ? (
              <div className="loader-content">
                <div className="spinner-small"></div>
                <span>Saving Profile...</span>
              </div>
            ) : (
              "Get Started"
            )}
          </button>
        </form>

        <div className="profile-footer">
          <p>By continuing, you agree to our <a href="#">Terms of Service</a></p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;