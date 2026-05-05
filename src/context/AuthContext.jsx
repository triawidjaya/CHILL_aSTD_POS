import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, logout } from '../services/auth';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const subscription = onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const [checkedInStaff, setCheckedInStaff] = useState(() => {
    const saved = localStorage.getItem('checkedInStaff');
    return saved ? JSON.parse(saved) : null;
  });

  async function fetchUserProfile(userId) {
    setProfileError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to fetch user profile:', error);
        setProfileError(error.message);
        setUserProfile(null);
        return;
      }

      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setProfileError(err.message);
    }
  }

  const checkIn = (staffData) => {
    setCheckedInStaff(staffData);
    localStorage.setItem('checkedInStaff', JSON.stringify(staffData));
  };

  const checkOut = () => {
    setCheckedInStaff(null);
    localStorage.removeItem('checkedInStaff');
  };

  const value = {
    user,
    session,
    loading,
    userProfile,
    profileError,
    checkedInStaff,
    checkIn,
    checkOut,
    logout: async () => {
      await logout();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setProfileError(null);
      checkOut();
    },
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
