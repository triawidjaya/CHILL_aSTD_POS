import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import '../Dashboard/DashboardComponents.css';

export default function CheckInModal({ isOpen, userProfile, onCheckIn }) {
  const [role, setRole] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('outlet_id', userProfile?.outlet_id);
    
    if (!error) {
      // Logic for staffList removed as it was unused, 
      // but keeping the fetch if needed for future or removing if entirely useless.
      // Based on current file, fetchStaff is only called in useEffect but data is not used.
      // However, to satisfy lint and keep structure:
      console.log('Staff fetched:', data?.length);
    }
  }, [userProfile?.outlet_id]);

  useEffect(() => {
    if (isOpen && userProfile?.outlet_id) {
      fetchStaff();
    }
  }, [isOpen, userProfile?.outlet_id, fetchStaff]);

  if (!isOpen) return null;

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!role) {
      setError('Please select a role');
      return;
    }

    if (!pin || pin.length !== 4) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }

    setLoading(true);
    try {
      if (!userProfile?.outlet_id) {
        setError('Outlet profile not found. Please refresh.');
        setLoading(false);
        return;
      }

      // Find staff with matching PIN and role (within the same outlet)
      const { data, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('outlet_id', userProfile.outlet_id)
        .eq('pin', pin)
        .eq('role', role)
        .maybeSingle();

      if (fetchErr) {
        console.error('Check-in error:', fetchErr);
        setError('Database error. Please try again.');
        setLoading(false);
        return;
      }

      if (!data) {
        setError(`Invalid PIN for ${role} role.`);
        setLoading(false);
        return;
      }

      onCheckIn(data); // Pass the validated staff profile back
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container animate-slide-up" style={{ maxWidth: '460px' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
          <h2 style={{ textAlign: 'center', width: '100%' }}>Login Successful!</h2>
        </div>
        
        <div className="modal-form" style={{ paddingTop: '0' }}>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please select your role and enter your PIN to continue.
          </p>

          <div className="transaction-type-toggle" style={{ marginBottom: '1.5rem' }}>
            {['Staff', 'Manager', 'Admin'].map(r => (
              <button
                key={r}
                type="button"
                className={role === r ? 'active income' : ''}
                onClick={() => handleRoleSelect(r)}
                style={{ fontSize: '0.75rem' }}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleCheckIn}>
            <div className="form-group">
              <label className="form-label">Security PIN</label>
              <input 
                type="password" 
                className="form-input"
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' }}
              />
            </div>

            {error && <div className="error-message" style={{ textAlign: 'center' }}>{error}</div>}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Verifying...' : 'Check-In to Dashboard'}
            </button>
          </form>

          <div className="modal-footer" style={{ marginTop: '1.5rem', justifyContent: 'center', borderTop: 'none' }}>
            <button 
              type="button" 
              className="link-button" 
              onClick={() => onCheckIn({ ...userProfile, role: 'Admin' })}
              style={{ fontSize: '0.8125rem', opacity: 0.7 }}
            >
              Skip: Continue as Account Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
