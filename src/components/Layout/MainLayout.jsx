import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './MainLayout.css';

export default function MainLayout({ children, title = 'Dashboard' }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-wrapper">
        <TopNav title={title} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
