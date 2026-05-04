import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const OutletContext = createContext(null);

export function OutletProvider({ children }) {
  const { userProfile } = useAuth();
  const [outlet, setOutlet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOutlet() {
      if (!userProfile?.outlet_id) {
        setOutlet(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('outlets')
          .select('*')
          .eq('id', userProfile.outlet_id)
          .single();

        if (error) {
          console.error('Failed to fetch outlet:', error);
          return;
        }

        setOutlet(data);
      } catch (err) {
        console.error('Error fetching outlet:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOutlet();
  }, [userProfile]);

  const value = {
    outlet,
    outletId: outlet?.id,
    loading,
    refreshOutlet: async () => {
      if (!userProfile?.outlet_id) return;
      const { data } = await supabase
        .from('outlets')
        .select('*')
        .eq('id', userProfile.outlet_id)
        .single();
      setOutlet(data);
    }
  };

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

export function useOutlet() {
  const context = useContext(OutletContext);
  if (context === undefined) {
    throw new Error('useOutlet must be used within an OutletProvider');
  }
  return context;
}
