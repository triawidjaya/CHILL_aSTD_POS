import Papa from 'papaparse';
import { format } from 'date-fns';

export function formatCurrency(amount, locale = 'id-ID') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: locale === 'id-ID' ? 'IDR' : 'GBP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date, dateFormat = 'dd MMM yyyy HH:mm') {
  return format(new Date(date), dateFormat);
}

export function generateCSV(transactions) {
  const data = transactions.map(txn => ({
    Tanggal: formatDate(txn.created_at, 'dd/MM/yyyy HH:mm'),
    Tipe: txn.type === 'income' ? 'Masuk' : 'Keluar',
    Kategori: txn.description || '-',
    'Metode Pembayaran': txn.payment_method === 'cash' ? 'Tunai' : txn.payment_method === 'card' ? 'Kartu' : 'Lainnya',
    Jumlah: txn.amount,
  }));

  // Add summary
  const summary = {
    Tanggal: 'RINGKASAN',
    Tipe: '',
    Kategori: '',
    'Metode Pembayaran': '',
    Jumlah: '',
  };

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  data.push(summary);
  data.push({
    Tanggal: 'Total Masuk',
    Tipe: income,
    Kategori: '',
    'Metode Pembayaran': '',
    Jumlah: '',
  });
  data.push({
    Tanggal: 'Total Keluar',
    Tipe: expense,
    Kategori: '',
    'Metode Pembayaran': '',
    Jumlah: '',
  });
  data.push({
    Tanggal: 'Saldo Bersih',
    Tipe: income - expense,
    Kategori: '',
    'Metode Pembayaran': '',
    Jumlah: '',
  });

  return Papa.unparse(data);
}

export function downloadCSV(csvContent, filename = `shift_${new Date().toISOString().split('T')[0]}.csv`) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function calculateBalance(transactions, paymentMethod = null) {
  return transactions
    .filter(t => !paymentMethod || t.payment_method === paymentMethod)
    .reduce((sum, t) => {
      const amount = t.type === 'income' ? t.amount : -t.amount;
      return sum + amount;
    }, 0);
}

export function groupTransactionsByDate(transactions) {
  const grouped = {};
  transactions.forEach(txn => {
    const date = formatDate(txn.created_at, 'dd MMM yyyy');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(txn);
  });
  return grouped;
}
