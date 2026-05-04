import React, { useState } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import Modal from './Modal';
import { validators } from '../../utils/validation';

export default function AddStaffModal({ isOpen, onClose, onSubmit, roles = ['Manager', 'Admin', 'Staff'] }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '',
    role: 'Staff',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (field) => {
    let err = '';
    switch (field) {
      case 'name':
        err = validators.staffName(formData.name);
        break;
      case 'email':
        err = validators.email(formData.email);
        break;
      case 'pin':
        err = validators.pin(formData.pin);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate all fields
    const nameErr = validators.staffName(formData.name);
    const emailErr = validators.email(formData.email);
    const pinErr = validators.pin(formData.pin);

    setErrors({
      name: nameErr,
      email: emailErr,
      pin: pinErr,
    });

    if (nameErr || emailErr || pinErr) {
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', pin: '', role: 'Staff' });
      setErrors({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', pin: '', role: 'Staff' });
    setErrors({});
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Staff Member" size="md">
      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <Input
          label="Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleBlur('name')}
          placeholder="Enter staff name"
          disabled={loading}
          error={errors.name}
        />

        <Input
          label="Email *"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          placeholder="Enter email address"
          disabled={loading}
          error={errors.email}
        />

        <Input
          label="PIN (4 digits) *"
          type="password"
          name="pin"
          value={formData.pin}
          onChange={(e) => {
            const val = e.target.value.slice(0, 4);
            setFormData(prev => ({ ...prev, pin: val }));
            setErrors(prev => ({ ...prev, pin: '' }));
          }}
          onBlur={() => handleBlur('pin')}
          placeholder="0000"
          disabled={loading}
          error={errors.pin}
          maxLength="4"
        />

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          >
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Staff'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
