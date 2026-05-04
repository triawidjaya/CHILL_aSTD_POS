import React, { useState } from 'react';
import './DashboardComponents.css';

export default function ShiftStatus({ activeShift, onOpenShift, onCloseShift, loading }) {
  const [initialCash, setInitialCash] = useState(0);

  if (loading) return <div className="card loading-card">Loading Shift Status...</div>;

  if (!activeShift) {
    return (
      <div className="card start-shift-card animate-fade-in">
        <div className="card-header">
          <h3>No Active Shift</h3>
          <p>Please open a shift to start recording transactions.</p>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label>Initial Cash Float (Optional)</label>
            <input 
              type="number" 
              value={initialCash} 
              onChange={(e) => setInitialCash(e.target.value)}
              placeholder="e.g. 500000"
            />
          </div>
          <button className="btn-success btn-block" onClick={() => onOpenShift(initialCash)}>
            Open New Shift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card active-shift-card animate-fade-in">
      <div className="shift-status-header">
        <div className="status-indicator">
          <span className="dot pulse success"></span>
          <h3>Shift Active</h3>
        </div>
        <button className="btn-danger-outline btn-sm" onClick={onCloseShift}>
          Close Shift
        </button>
      </div>
      <div className="shift-details">
        <div className="detail-item">
          <label>Opened At</label>
          <span>{new Date(activeShift.opened_at).toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <label>Initial Float</label>
          <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(activeShift.initial_cash)}</span>
        </div>
      </div>
    </div>
  );
}
