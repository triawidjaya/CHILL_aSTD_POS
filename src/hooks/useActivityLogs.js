import { useEffect, useState } from 'react';
import {
  fetchActivityLogs,
  subscribeToActivityLogs,
} from '../services/activityLogs';

export function useActivityLogs(outletId, limit = 100, offset = 0) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!outletId) return;

    (async () => {
      try {
        setLoading(true);
        const { data, count } = await fetchActivityLogs(outletId, limit, offset);
        setLogs(data);
        setTotal(count);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    // Subscribe to real-time changes
    const subscription = subscribeToActivityLogs(outletId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setLogs(prev => [payload.new, ...prev]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [outletId, limit, offset]);

  return { logs, total, loading, error };
}
