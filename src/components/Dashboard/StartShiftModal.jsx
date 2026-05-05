import React, { useState } from 'react';
import '../Dashboard/DashboardComponents.css';

export default function StartShiftModal({ isOpen, onClose, onConfirm }) {
  const [initialCash, setInitialCash] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(parseFloat(initialCash) || 0);
    setInitialCash('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container animate-slide-up" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Start New Shift</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <p className="shift-description" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            Please enter the starting cash amount currently in the drawer.
          </p>
          
          <div className="form-group">
            <label className="form-label">Initial Cash Float (IDR)</label>
            <input 
              type="number" 
              className="form-input"
              value={initialCash}
              onChange={(e) => setInitialCash(e.target.value)}
              placeholder="e.g. 500000"
              autoFocus
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success">Open Shift</button>
          </div>
        </form>
      </div>
    </div>
  );
}
