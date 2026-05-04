import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOutlet } from '../hooks/useOutlet';
import './TopNav.css';

export default function TopNav({ title }) {
  const { userProfile } = useAuth();
  const { outlet } = useOutlet();

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-nav">
      <div className="nav-left">
        <h2 className="page-title">{title}</h2>
      </div>

      <div className="nav-right">
        <div className="outlet-info">
          <span className="outlet-name">{outlet?.name || 'Loading...'}</span>
          <span className="user-role-badge">{userProfile?.role}</span>
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{userProfile?.name || userProfile?.email}</span>
          </div>
          <div className="user-avatar">
            {getInitials(userProfile?.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
