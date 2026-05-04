// Generate CSV for shift closeout
export function generateShiftCSV(shift, transactions, outlet) {
  // Calculate totals
  const totals = {
    income: 0,
    expense: 0,
    cash: 0,
    card: 0,
    other: 0,
  };

  transactions.forEach(txn => {
    if (txn.type === 'income') {
      totals.income += txn.amount;
    } else {
      totals.expense += txn.amount;
    }

    if (txn.payment_method === 'cash') {
      totals.cash += txn.type === 'income' ? txn.amount : -txn.amount;
    } else if (txn.payment_method === 'card') {
      totals.card += txn.type === 'income' ? txn.amount : -txn.amount;
    } else if (txn.payment_method === 'other') {
      totals.other += txn.type === 'income' ? txn.amount : -txn.amount;
    }
  });

  // Build CSV
  let csv = 'SHIFT CLOSEOUT REPORT\n';
  csv += `Outlet,Date,Shift ID\n`;
  csv += `"${outlet.name}","${new Date(shift.opened_at).toLocaleDateString()}","${shift.id}"\n\n`;

  csv += 'TRANSACTIONS\n';
  csv += 'Date,Type,Category,Amount,Payment Method,Description\n';

  transactions.forEach(txn => {
    csv += `"${new Date(txn.created_at).toLocaleString()}","${txn.type}","${txn.category_id || 'N/A'}","${txn.amount}","${txn.payment_method}","${txn.description || ''}"\n`;
  });

  csv += '\nSUMMARY\n';
  csv += `Total Income,"${totals.income}"\n`;
  csv += `Total Expense,"${totals.expense}"\n`;
  csv += `Net,"${totals.income - totals.expense}"\n\n`;

  csv += 'BY PAYMENT METHOD\n';
  csv += `Cash,"${totals.cash}"\n`;
  csv += `Card,"${totals.card}"\n`;
  csv += `Other,"${totals.other}"\n`;

  return csv;
}

// Download CSV file
export function downloadCSV(csv, filename = 'shift_report.csv') {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
