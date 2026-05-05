import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import '../Dashboard/DashboardComponents.css';

export default function CheckInModal({ isOpen, userProfile, onCheckIn }) {
  const [role, setRole] = useState('');
  const [pin, setPin] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userProfile?.outlet_id) {
      fetchStaff();
    }
  }, [isOpen, userProfile]);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('outlet_id', userProfile.outlet_id);
    
    if (!error) setStaffList(data);
  };

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
      // Find staff with matching PIN and role (within the same outlet)
      const { data, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('outlet_id', userProfile.outlet_id)
        .eq('pin', pin)
        .eq('role', role)
        .single();

      if (fetchErr || !data) {
        setError('Invalid PIN for selected role');
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
        </div>
      </div>
    </div>
  );
}
