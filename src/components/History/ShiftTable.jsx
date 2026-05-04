import React from 'react';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import Table from '../Common/Table';
import './ShiftTable.css';

export default function ShiftTable({ shifts, onExport, onView, loading = false }) {
  const columns = [
    {
      key: 'opened_at',
      label: 'Date',
      width: '150px',
      render: (val) => new Date(val).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (val) => (
        <Badge variant={val === 'CLOSED' ? 'success' : 'warning'} size="sm">
          {val}
        </Badge>
      )
    },
    {
      key: 'initial_cash',
      label: 'Initial Cash',
      width: '120px',
      render: (val) => `$${parseFloat(val || 0).toFixed(2)}`
    },
    {
      key: 'closed_at',
      label: 'Closed At',
      width: '150px',
      render: (val) => val ? new Date(val).toLocaleString() : '-'
    },
    {
      key: 'id',
      label: 'Actions',
      width: '150px',
      render: (val, row) => (
        <div className="action-buttons">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(row)}
          >
            View
          </Button>
          {row.status === 'CLOSED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onExport?.(row)}
            >
              Export
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={shifts}
      loading={loading}
    />
  );
}
