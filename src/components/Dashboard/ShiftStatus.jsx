import React, { useState } from 'react';
import StartShiftModal from './StartShiftModal';
import './DashboardComponents.css';

export default function ShiftStatus({ activeShift, onOpenShift, onCloseShift, loading, canOpenShift }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) return <div className="card loading-card">Loading Shift Status...</div>;

  if (!activeShift) {
    return (
      <>
        <div className="card start-shift-card animate-fade-in">
          <div className="card-header">
            <h3>No Active Shift</h3>
          </div>
          <div className="card-body shift-empty-content">
            <p className="shift-description">
              {canOpenShift 
                ? 'There is no active shift currently running. Open a new one to begin.' 
                : 'There is no active shift currently running. Only Staff or Admin can open a new shift.'}
            </p>
            {canOpenShift && (
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                🚀 Start New Shift
              </button>
            )}
          </div>
        </div>
        
        <StartShiftModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onConfirm={onOpenShift}
        />
      </>
    );
  }

  return (
    <div className="card active-shift-card animate-fade-in">
      <div className="card-header shift-header-flex">
        <div className="status-indicator">
          <span className="dot pulse success"></span>
          <h3>Shift Currently Active</h3>
        </div>
        <button className="btn btn-outline-danger btn-sm" onClick={onCloseShift}>
          Close Shift
        </button>
      </div>
      <div className="card-body">
        <div className="shift-stats-grid">
          <div className="shift-stat-item">
            <span className="stat-label">Opened On</span>
            <span className="stat-value">{new Date(activeShift.opened_at).toLocaleDateString()}</span>
            <span className="stat-sub">{new Date(activeShift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="shift-stat-item">
            <span className="stat-label">Starting Float</span>
            <span className="stat-value">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(activeShift.initial_cash)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
