import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './TopNav.css';

export default function TopNav({ title }) {
  const { userProfile } = useAuth();
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date().toLocaleDateString());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="top-nav">
      <div className="nav-left">
        <h1>{title}</h1>
      </div>

      <div className="nav-right">
        <div className="date-badge">{date}</div>

        {userProfile && (
          <div className="user-section">
            <div className="user-info">
              <span className="user-name">{userProfile.name}</span>
              <span className="user-role">{userProfile.role}</span>
            </div>

            <div className="dropdown-container">
              <button
                className="btn btn-icon btn-outline"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item disabled">
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item danger">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
