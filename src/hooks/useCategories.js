import { useEffect, useState } from 'react';
import {
  fetchCategories,
  addCategory as addCat,
  updateCategory as updateCat,
  deleteCategory as deleteCat,
  subscribeToCategories,
} from '../services/categories';

export function useCategories(outletId, type = null) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!outletId) return;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchCategories(outletId, type);
        setCategories(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    // Subscribe to real-time changes
    const subscription = subscribeToCategories(outletId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setCategories(prev => [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name)));
      } else if (payload.eventType === 'UPDATE') {
        setCategories(prev =>
          prev.map(c => (c.id === payload.new.id ? payload.new : c))
        );
      } else if (payload.eventType === 'DELETE') {
        setCategories(prev => prev.filter(c => c.id !== payload.old.id));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [outletId, type]);

  const addCategory = async (name, categoryType) => {
    try {
      const result = await addCat(outletId, name, categoryType);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (categoryId, updates) => {
    try {
      const result = await updateCat(categoryId, updates);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await deleteCat(categoryId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
