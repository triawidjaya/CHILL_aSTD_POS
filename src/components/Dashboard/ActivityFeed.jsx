import React, { useEffect, useState } from 'react';
import { fetchActivityLogs, subscribeToActivityLogs } from '../../services/activityLogs';
import './DashboardComponents.css';

export default function ActivityFeed({ outletId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!outletId) return;

    const loadLogs = async () => {
      try {
        const { data } = await fetchActivityLogs(outletId, 10);
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();

    const subscription = subscribeToActivityLogs(outletId, (payload) => {
      if (payload.eventType === 'INSERT') {
        // Refresh to get joined user data
        loadLogs();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [outletId]);

  const formatAction = (action) => {
    return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) return <div className="card loading-card">Loading Activity...</div>;

  return (
    <div className="card activity-feed-card animate-fade-in">
      <div className="card-header">
        <h3>Recent Activity</h3>
      </div>
      <div className="card-body no-padding">
        {logs.length === 0 ? (
          <div className="empty-state">No recent activity.</div>
        ) : (
          <ul className="activity-list">
            {logs.map(log => (
              <li key={log.id} className="activity-item">
                <div className="activity-icon">
                  <ActivityIcon action={log.action} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>{log.user?.name || 'System'}</strong> {formatAction(log.action)}
                  </p>
                  <span className="activity-time">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ActivityIcon({ action }) {
  if (action.includes('transaction')) return '💰';
  if (action.includes('staff') || action.includes('user')) return '👥';
  if (action.includes('shift')) return '⏱️';
  if (action.includes('category')) return '🏷️';
  return '⚙️';
}
