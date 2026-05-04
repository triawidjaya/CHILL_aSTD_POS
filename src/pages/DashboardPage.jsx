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
  const { userProfile, profileError, loading } = useAuth();
  const { outletId } = useOutlet();
  const { activeShift, openShift, closeCurrentShift, loading: shiftLoading } = useShifts(outletId);
  const { transactions, loading: txnLoading } = useTransactions(outletId, activeShift?.id);
  const { balance, loading: balanceLoading } = useShiftBalance(outletId, activeShift?.id);
  
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);

  if (loading) {
    return <MainLayout><div>Synchronizing session...</div></MainLayout>;
  }

  if (profileError || !userProfile) {
    return (
      <MainLayout>
        <div className="error-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Profile Sync Error</h2>
          <p>We couldn't load your user profile. {profileError || 'Please try logging in again.'}</p>
          <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Retry Sync
          </button>
        </div>
      </MainLayout>
    );
  }

  const handleOpenShift = async (amount) => {
    try {
      await openShift(amount);
    } catch (err) {
      console.error('Failed to open shift:', err);
      alert('Failed to open shift: ' + err.message);
    }
  };

  const handleCloseShift = async () => {
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
      <div className="dashboard-header-actions">
        <button 
          className="btn-primary" 
          disabled={!activeShift} 
          onClick={() => setIsTrxModalOpen(true)}
        >
          + New Transaction
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <ShiftStatus
            activeShift={activeShift}
            onOpenShift={handleOpenShift}
            onCloseShift={handleCloseShift}
            loading={shiftLoading}
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
