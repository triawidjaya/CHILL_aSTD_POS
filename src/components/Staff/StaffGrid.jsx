import React from 'react';
import StaffCard from './StaffCard';
import './StaffGrid.css';

export default function StaffGrid({ staff, onEdit, onDelete, loading = false }) {
  if (loading) {
    return <div className="staff-grid loading">Loading staff...</div>;
  }

  if (!staff || staff.length === 0) {
    return (
      <div className="staff-empty">
        <p>No staff members found. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="staff-grid">
      {staff.map(s => (
        <StaffCard
          key={s.id}
          staff={s}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
