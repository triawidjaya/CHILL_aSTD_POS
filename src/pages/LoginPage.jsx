import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, registerOutlet, authenticateWithPin } from '../services/auth';
import { seedTestData } from '../utils/seedTestData';
import { validators } from '../utils/validation';
import CheckInModal from '../components/Auth/CheckInModal';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { userProfile, checkIn } = useAuth();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'pin'
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Email mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  // Register mode
  const [businessName, setBusinessName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [businessNameError, setBusinessNameError] = useState('');
  const [registerPasswordError, setRegisterPasswordError] = useState('');
  const [registerPasswordConfirmError, setRegisterPasswordConfirmError] = useState('');

  // PIN mode
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate fields
    const emailErr = validators.email(email);
    setEmailError(emailErr);
    if (emailErr) return;

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      setShowCheckIn(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const businessErr = validators.businessName(businessName);
    const emailErr = validators.email(email);
    const passwordErr = validators.password(registerPassword);
    const confirmErr = validators.passwordMatch(registerPassword, registerPasswordConfirm);

    setBusinessNameError(businessErr);
    setEmailError(emailErr);
    setRegisterPasswordError(passwordErr);
    setRegisterPasswordConfirmError(confirmErr);

    if (businessErr || emailErr || passwordErr || confirmErr) return;

    setLoading(true);
    try {
      await registerOutlet(email, registerPassword, businessName);
      setError(null);
      setMode('login');
      setEmail('');
      setBusinessName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate PIN
    const pinErr = validators.pin(pin);
    setPinError(pinErr);
    if (pinErr) return;

    setLoading(true);
    try {
      const user = await authenticateWithPin(pin);
      // Store user info in session storage
      sessionStorage.setItem('pinUser', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      setError('Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await seedTestData();
      if (result.success) {
        setEmail('manager@test.com');
        setPassword('Password123!');
        alert('Test user created: manager@test.com / Password123!');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError(null);
    setEmailError('');
    setBusinessNameError('');
    setRegisterPasswordError('');
    setRegisterPasswordConfirmError('');
    setPinError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>CHILL aSTD POS</h1>
          <p>Point of Sale System</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                onBlur={() => setEmailError(validators.email(email))}
                placeholder="your@email.com"
                className={emailError ? 'input-error' : ''}
              />
              {emailError && <span className="form-error">{emailError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="form-footer">
              <button
                type="button"
                className="link-button"
                onClick={() => handleModeChange('register')}
              >
                Create New Outlet
              </button>
              <button
                type="button"
                className="link-button seed-btn"
                onClick={handleSeed}
              >
                (Dev) Seed Test User
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  setBusinessNameError('');
                }}
                onBlur={() => setBusinessNameError(validators.businessName(businessName))}
                placeholder="e.g., CHILL Hostel"
                className={businessNameError ? 'input-error' : ''}
              />
              {businessNameError && <span className="form-error">{businessNameError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="registerEmail">Email</label>
              <input
                id="registerEmail"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                onBlur={() => setEmailError(validators.email(email))}
                placeholder="your@email.com"
                className={emailError ? 'input-error' : ''}
              />
              {emailError && <span className="form-error">{emailError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input
                id="registerPassword"
                type="password"
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value);
                  setRegisterPasswordError('');
                }}
                onBlur={() => setRegisterPasswordError(validators.password(registerPassword))}
                placeholder="••••••••"
                className={registerPasswordError ? 'input-error' : ''}
              />
              {registerPasswordError && <span className="form-error">{registerPasswordError}</span>}
              <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                Min 8 chars: uppercase, lowercase, number
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="registerPasswordConfirm">Confirm Password</label>
              <input
                id="registerPasswordConfirm"
                type="password"
                value={registerPasswordConfirm}
                onChange={(e) => {
                  setRegisterPasswordConfirm(e.target.value);
                  setRegisterPasswordConfirmError('');
                }}
                onBlur={() => setRegisterPasswordConfirmError(validators.passwordMatch(registerPassword, registerPasswordConfirm))}
                placeholder="••••••••"
                className={registerPasswordConfirmError ? 'input-error' : ''}
              />
              {registerPasswordConfirmError && <span className="form-error">{registerPasswordConfirmError}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Outlet...' : 'Create Outlet'}
            </button>

            <div className="form-footer">
              <button
                type="button"
                className="link-button"
                onClick={() => handleModeChange('login')}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {mode === 'pin' && (
          <form onSubmit={handlePinLogin}>
            <div className="form-group">
              <label htmlFor="pin">Enter PIN</label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 4);
                  setPin(val);
                  setPinError('');
                }}
                onBlur={() => setPinError(validators.pin(pin))}
                placeholder="0000"
                maxLength="4"
                className={pinError ? 'input-error' : ''}
              />
              {pinError && <span className="form-error">{pinError}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login with PIN'}
            </button>

            <div className="form-footer">
              <button
                type="button"
                className="link-button"
                onClick={() => handleModeChange('login')}
              >
                Back to Email Login
              </button>
            </div>
          </form>
        )}
      <CheckInModal 
        isOpen={showCheckIn} 
        userProfile={userProfile} 
        onCheckIn={(staffData) => {
          checkIn(staffData);
          navigate('/');
        }}
      />
      </div>
    </div>
  );
}
