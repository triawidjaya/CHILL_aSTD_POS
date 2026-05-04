import { useEffect, useState } from 'react';
import {
  openShift,
  closeShift,
  getActiveShift,
  getShiftHistory,
} from '../services/shifts';
import { subscribeToShifts } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export function useShifts(outletId) {
  const { userProfile } = useAuth();
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!outletId) return;

    (async () => {
      try {
        setLoading(true);
        const shift = await getActiveShift(outletId);
        setActiveShift(shift);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    // Subscribe to real-time changes
    const subscription = subscribeToShifts(outletId, (payload) => {
      if (payload.eventType === 'UPDATE') {
        if (payload.new.status === 'OPEN') {
          setActiveShift(payload.new);
        } else {
          setActiveShift(null);
        }
      } else if (payload.eventType === 'INSERT' && payload.new.status === 'OPEN') {
        setActiveShift(payload.new);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [outletId]);

  const handleOpenShift = async (initialCash = 0) => {
    if (!userProfile) throw new Error('User not authenticated');
    try {
      const shift = await openShift(outletId, initialCash, userProfile.id);
      setActiveShift(shift);
      return shift;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift) throw new Error('No active shift');
    try {
      const shift = await closeShift(activeShift.id);
      setActiveShift(null);
      return shift;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    activeShift,
    loading,
    error,
    openShift: handleOpenShift,
    closeCurrentShift: handleCloseShift,
  };
}

export function useShiftHistory(outletId) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!outletId) return;

    (async () => {
      try {
        setLoading(true);
        const data = await getShiftHistory(outletId);
        setShifts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [outletId]);

  return { shifts, loading, error };
}
