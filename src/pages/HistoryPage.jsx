import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useOutlet } from '../hooks/useOutlet';
import { useShiftHistory } from '../hooks/useShifts';
import { getTransactions } from '../services/transactions';
import { useTranslation } from '../context/LanguageContext';
import '../styles/history.css';

export default function HistoryPage() {
  const { outletId } = useOutlet();
  const { shifts, loading, error } = useShiftHistory(outletId);
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async (shift) => {
    setExporting(true);
    try {
      const transactions = await getTransactions(outletId, shift.id);
      
      const headers = ['Time', 'Type', 'Category', 'Method', 'Amount', 'Description'];
      const rows = transactions.map(t => [
        new Date(t.created_at).toLocaleString(),
        t.type,
        t.categories?.name || 'Uncategorized',
        t.payment_method,
        t.amount,
        t.description
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `shift_report_${shift.id}_${new Date(shift.opened_at).toLocaleDateString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <MainLayout title={t('history_page_title')}>
      <div className="history-header">
        <h2>{t('history_title')}</h2>
        <p>{t('history_desc')}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card history-card">
        <div className="card-body no-padding">
          {loading ? (
            <div className="loading-state">Loading shift history...</div>
          ) : shifts.length === 0 ? (
            <div className="empty-state">No shift history found.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('th_datetime')}</th>
                  <th>{t('th_initial_cash')}</th>
                  <th>{t('th_status')}</th>
                  <th className="text-right">{t('th_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map(shift => (
                  <tr key={shift.id}>
                    <td>
                      <div className="shift-time">
                        <strong>{new Date(shift.opened_at).toLocaleDateString()}</strong>
                        <span>{new Date(shift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(shift.initial_cash)}</td>
                    <td>
                      <span className={`status-badge ${shift.status.toLowerCase()}`}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        className="btn-outline btn-sm"
                        onClick={() => handleExportCSV(shift)}
                        disabled={exporting}
                      >
                        {exporting ? '...' : t('btn_download_csv')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
