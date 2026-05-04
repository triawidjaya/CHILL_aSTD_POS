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
      <div className="balance-card total">
        <label>Net Balance</label>
        <h2 className={balance.total >= 0 ? 'text-success' : 'text-danger'}>
          {formatCurrency(balance.total)}
        </h2>
      </div>
      
      <div className="balance-subgrid">
        <div className="balance-card">
          <label>Cash</label>
          <span className="amount">{formatCurrency(balance.cash)}</span>
        </div>
        <div className="balance-card">
          <label>Card</label>
          <span className="amount">{formatCurrency(balance.card)}</span>
        </div>
        <div className="balance-card">
          <label>Other</label>
          <span className="amount">{formatCurrency(balance.other)}</span>
        </div>
      </div>
    </div>
  );
}
