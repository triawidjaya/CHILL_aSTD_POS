import React, { useState } from 'react';
import { useOutlet } from '../../hooks/useOutlet';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../services/activityLogs';
import { validators } from '../../utils/validation';
import './DashboardComponents.css';

export default function TransactionModal({ isOpen, onClose, shiftId }) {
  const { outletId } = useOutlet();
  const { userProfile } = useAuth();
  const { categories, loading: catsLoading } = useCategories(outletId);
  const { users, loading: usersLoading } = useUsers(outletId);
  const { addTransaction } = useTransactions(outletId, shiftId);

  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [description, setDescription] = useState('');
  const [staffId, setStaffId] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [amountError, setAmountError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [staffError, setStaffError] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate fields
    const amtErr = validators.amount(amount);
    const catErr = validators.category(categoryId);
    const stfErr = validators.staff(staffId);

    setAmountError(amtErr);
    setCategoryError(catErr);
    setStaffError(stfErr);

    if (amtErr || catErr || stfErr) return;

    setLoading(true);
    try {
      const trx = await addTransaction({
        shift_id: shiftId,
        category_id: categoryId,
        amount: parseFloat(amount),
        type,
        payment_method: paymentMethod,
        description,
        created_by_user_id: staffId // Associating with the selected staff
      });

      // Log the activity
      await logActivity(outletId, staffId, 'add_transaction', {
        amount,
        type,
        category: categories.find(c => c.id === categoryId)?.name
      });

      // Reset form
      setAmount('');
      setCategoryId('');
      setStaffId('');
      setDescription('');
      setFormError('');
      onClose();
    } catch (err) {
      setFormError('Error adding transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Transaction</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {formError && <div className="error-message" style={{ margin: '1rem' }}>{formError}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="transaction-type-toggle">
            <button
              type="button"
              className={type === 'income' ? 'active income' : ''}
              onClick={() => { setType('income'); setCategoryId(''); setCategoryError(''); }}
            >
              Income
            </button>
            <button
              type="button"
              className={type === 'expense' ? 'active expense' : ''}
              onClick={() => { setType('expense'); setCategoryId(''); setCategoryError(''); }}
            >
              Expense
            </button>
          </div>

          <div className="form-group">
            <label>Staff on Duty *</label>
            <select
              value={staffId}
              onChange={e => { setStaffId(e.target.value); setStaffError(''); }}
              onBlur={() => setStaffError(validators.staff(staffId))}
              className={staffError ? 'input-error' : ''}
              disabled={usersLoading}
            >
              <option value="">Select Staff</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            {staffError && <span className="form-error">{staffError}</span>}
          </div>

          <div className="form-group">
            <label>Amount (IDR) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setAmountError(''); }}
              onBlur={() => setAmountError(validators.amount(amount))}
              placeholder="0"
              className={amountError ? 'input-error' : ''}
            />
            {amountError && <span className="form-error">{amountError}</span>}
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={categoryId}
              onChange={e => { setCategoryId(e.target.value); setCategoryError(''); }}
              onBlur={() => setCategoryError(validators.category(categoryId))}
              className={categoryError ? 'input-error' : ''}
              disabled={catsLoading}
            >
              <option value="">Select Category</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {categoryError && <span className="form-error">{categoryError}</span>}
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="method-grid">
              {['cash', 'card', 'other'].map(m => (
                <button
                  key={m}
                  type="button"
                  className={paymentMethod === m ? 'active' : ''}
                  onClick={() => setPaymentMethod(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notes..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
