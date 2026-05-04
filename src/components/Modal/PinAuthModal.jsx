import React, { useState } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import Modal from './Modal';
import './AuthModal.css';

export default function PinAuthModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // PIN validation happens in parent component via Supabase
      if (onSuccess) {
        await onSuccess(pin);
      }
    } catch (err) {
      setError(err.message || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Authentication" size="sm">
      <form onSubmit={handleSubmit} className="auth-form">
        <p className="form-description">
          Enter your PIN to access the system
        </p>

        <Input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          error={error}
          disabled={loading}
          autoFocus
        />

        <div className="form-actions">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !pin}
          >
            {loading ? 'Verifying...' : 'Login'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
