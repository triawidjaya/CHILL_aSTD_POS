import { useEffect, useState } from 'react';
import {
  getTransactions,
  addTransaction as addTxn,
  deleteTransaction as deleteTxn,
  getShiftBalance,
} from '../services/transactions';
import { subscribeToTransactions } from '../services/supabase';

export function useTransactions(outletId, shiftId = null) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!outletId) return;

    (async () => {
      try {
        setLoading(true);
        const data = await getTransactions(outletId, shiftId);
        setTransactions(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    // Subscribe to real-time changes
    const subscription = subscribeToTransactions(outletId, (payload) => {
      // Refresh all if complex, or patch locally
      if (payload.eventType === 'INSERT') {
        // Only add if it belongs to current shift filter (if any)
        if (!shiftId || payload.new.shift_id === shiftId) {
          setTransactions(prev => [payload.new, ...prev]);
        }
      } else if (payload.eventType === 'UPDATE') {
        setTransactions(prev =>
          prev.map(t => (t.id === payload.new.id ? payload.new : t))
        );
      } else if (payload.eventType === 'DELETE') {
        setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [outletId, shiftId]);

  const addTransaction = async (data) => {
    try {
      const result = await addTxn({ outlet_id: outletId, ...data });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await deleteTxn(transactionId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
  };
}

export function useShiftBalance(outletId, shiftId) {
  const [balance, setBalance] = useState({
    total: 0,
    cash: 0,
    card: 0,
    other: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!outletId || !shiftId) {
      setBalance({ total: 0, cash: 0, card: 0, other: 0 });
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const result = await getShiftBalance(outletId, shiftId);
        setBalance(result);
      } catch (err) {
        console.error('Failed to calculate balance:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [outletId, shiftId]);

  return { balance, loading };
}
