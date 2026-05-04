import React from 'react';
import './DashboardComponents.css';

export default function TransactionList({ transactions, loading, maxRows = 10 }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="card loading-card">Fetching Transactions...</div>;

  const displayTransactions = transactions.slice(0, maxRows);

  return (
    <div className="card transaction-list-card animate-fade-in">
      <div className="card-header">
        <h3>Recent Transactions</h3>
      </div>
      <div className="card-body no-padding">
        {displayTransactions.length === 0 ? (
          <div className="empty-state">No transactions yet for this shift.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Category</th>
                <th>Method</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {displayTransactions.map(trx => (
                <tr key={trx.id} className={trx.type === 'expense' ? 'row-expense' : 'row-income'}>
                  <td>{new Date(trx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className="category-tag">{trx.categories?.name || 'Uncategorized'}</span>
                    <small className="trx-desc">{trx.description}</small>
                  </td>
                  <td><span className={`method-badge ${trx.payment_method}`}>{trx.payment_method}</span></td>
                  <td className={`text-right amount-cell ${trx.type}`}>
                    {trx.type === 'expense' ? '-' : '+'}{formatCurrency(trx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
