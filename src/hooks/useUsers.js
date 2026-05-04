import { useEffect, useState } from 'react';
import {
  fetchOutletUsers,
  addUserToOutlet,
  updateUser,
  deleteUser,
  subscribeToUsers,
} from '../services/users';

export function useUsers(outletId) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!outletId) return;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchOutletUsers(outletId);
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    // Subscribe to real-time changes
    const subscription = subscribeToUsers(outletId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setUsers(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setUsers(prev =>
          prev.map(u => (u.id === payload.new.id ? payload.new : u))
        );
      } else if (payload.eventType === 'DELETE') {
        setUsers(prev => prev.filter(u => u.id !== payload.old.id));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [outletId]);

  const addUser = async (data) => {
    try {
      const result = await addUserToOutlet(outletId, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserData = async (userId, updates) => {
    try {
      const result = await updateUser(userId, updates);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUserData = async (userId) => {
    try {
      await deleteUser(userId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
    updateUserData,
    deleteUserData,
  };
}
