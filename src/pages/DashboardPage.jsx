import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import ShiftStatus from '../components/Dashboard/ShiftStatus';
import BalanceWidget from '../components/Dashboard/BalanceWidget';
import TransactionList from '../components/Dashboard/TransactionList';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import TransactionModal from '../components/Dashboard/TransactionModal';
import { useAuth } from '../context/AuthContext';
import { useOutlet } from '../hooks/useOutlet';
import { useShifts } from '../hooks/useShifts';
import { useTransactions, useShiftBalance } from '../hooks/useTransactions';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const { userProfile, profileError, loading, checkedInStaff } = useAuth();
  const { outletId } = useOutlet();
  const { activeShift, openShift, closeCurrentShift, loading: shiftLoading } = useShifts(outletId);
  const { transactions, loading: txnLoading } = useTransactions(outletId, activeShift?.id);
  const { balance, loading: balanceLoading } = useShiftBalance(outletId, activeShift?.id);
  
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);

  // Role permissions
  const isAdmin = checkedInStaff?.role === 'Admin';
  const isStaff = checkedInStaff?.role === 'Staff';
  const canPerformTransactions = isAdmin || isStaff;

  if (loading) {
    return <MainLayout><div>Synchronizing session...</div></MainLayout>;
  }

  if (profileError || !userProfile || !checkedInStaff) {
    return (
      <MainLayout>
        <div className="error-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Session Required</h2>
          <p>Please log in and check-in with your PIN to access the dashboard.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/login'} style={{ marginTop: '1rem' }}>
            Go to Login
          </button>
        </div>
      </MainLayout>
    );
  }

  const handleOpenShift = async (amount) => {
    if (!canPerformTransactions) return;
    try {
      await openShift(amount);
    } catch (err) {
      console.error('Failed to open shift:', err);
      alert('Failed to open shift: ' + err.message);
    }
  };

  const handleCloseShift = async () => {
    if (!canPerformTransactions) return;
    if (!window.confirm('Are you sure you want to close this shift?')) return;
    try {
      await closeCurrentShift();
    } catch (err) {
      console.error('Failed to close shift:', err);
      alert('Failed to close shift: ' + err.message);
    }
  };

  return (
    <MainLayout title="Ongoing Shift Dashboard">
      <div className="dashboard-header-section">
        <div className="welcome-text">
          <h1>Welcome, {checkedInStaff?.name || userProfile?.email?.split('@')[0]}</h1>
          <p>Role: <span className="badge badge-primary">{checkedInStaff?.role}</span></p>
        </div>
        <div className="dashboard-header-actions">
          {canPerformTransactions && (
            <button 
              className="btn btn-primary" 
              disabled={!activeShift} 
              onClick={() => setIsTrxModalOpen(true)}
            >
              <span className="btn-icon">+</span> New Transaction
            </button>
          )}
          
          <button className="btn btn-success">
            <span className="btn-icon">📥</span> Export Excel
          </button>

          {canPerformTransactions && (
            <button className="btn btn-outline-danger" onClick={handleCloseShift}>
              <span className="btn-icon">↪️</span> Close Shift / Start New
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <ShiftStatus
            activeShift={activeShift}
            onOpenShift={handleOpenShift}
            onCloseShift={handleCloseShift}
            loading={shiftLoading}
            canOpenShift={canPerformTransactions}
          />

          <BalanceWidget
            balance={balance}
            loading={balanceLoading}
          />

          <TransactionList
            transactions={transactions}
            loading={txnLoading}
            maxRows={10}
          />
        </div>

        <div className="dashboard-side-col">
          <ActivityFeed outletId={outletId} />
        </div>
      </div>

      {isTrxModalOpen && (
        <TransactionModal 
          isOpen={isTrxModalOpen} 
          onClose={() => setIsTrxModalOpen(false)}
          shiftId={activeShift?.id}
        />
      )}
    </MainLayout>
  );
}
