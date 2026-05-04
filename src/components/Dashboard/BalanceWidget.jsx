import React from 'react';
import './DashboardComponents.css';

export default function BalanceWidget({ balance, loading }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="card loading-card">Calculating Balances...</div>;

  return (
    <div className="balance-grid">
      <div className="balance-item cash">
        <div className="balance-icon">💵</div>
        <div className="balance-info">
          <span className="balance-label">Cash Balance</span>
          <span className="balance-amount">{formatCurrency(balance.cash)}</span>
        </div>
      </div>
      
      <div className="balance-item card">
        <div className="balance-icon">💳</div>
        <div className="balance-info">
          <span className="balance-label">Card Balance</span>
          <span className="balance-amount">{formatCurrency(balance.card)}</span>
        </div>
      </div>
      
      <div className="balance-item other">
        <div className="balance-icon">🪙</div>
        <div className="balance-info">
          <span className="balance-label">Other Balance</span>
          <span className="balance-amount">{formatCurrency(balance.other)}</span>
        </div>
      </div>
    </div>
  );
}
