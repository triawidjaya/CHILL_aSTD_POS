import React from 'react';
import Card, { CardBody } from '../Common/Card';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import './StaffCard.css';

export default function StaffCard({ staff, onEdit, onDelete }) {
  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'primary',
      'Manager': 'secondary',
      'Staff': 'muted',
    };
    return colors[role] || 'muted';
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'danger';
  };

  return (
    <Card className="staff-card">
      <CardBody>
        <div className="staff-card-header">
          <div className="staff-avatar">
            {staff.name.charAt(0).toUpperCase()}
          </div>
          <div className="staff-badges">
            <Badge variant={getRoleColor(staff.role)} size="sm">
              {staff.role}
            </Badge>
            <Badge variant={getStatusColor(staff.status)} size="sm">
              {staff.status}
            </Badge>
          </div>
        </div>

        <div className="staff-details">
          <h4>{staff.name}</h4>
          <p className="staff-email">{staff.email}</p>
          <p className="staff-pin">PIN: {staff.pin}</p>
        </div>

        <div className="staff-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(staff)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(staff.id)}
          >
            Delete
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
