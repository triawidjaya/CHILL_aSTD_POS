import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './MainLayout.css';

export default function MainLayout({ children, title }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopNav title={title} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
