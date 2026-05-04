import { supabase } from './supabase';

export async function getTransactions(outletId, shiftId = null) {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (name)
    `)
    .eq('outlet_id', outletId)
    .order('created_at', { ascending: false });

  if (shiftId) {
    query = query.eq('shift_id', shiftId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data;
}

export async function addTransaction(transactionData) {
  const {
    outlet_id,
    shift_id,
    category_id,
    amount,
    type,
    payment_method,
    description,
    created_by_user_id
  } = transactionData;

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      outlet_id,
      shift_id,
      category_id,
      amount,
      type,
      payment_method,
      description,
      created_by_user_id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add transaction: ${error.message}`);
  }

  return data;
}

export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}

export async function getShiftBalance(outletId, shiftId) {
  if (!shiftId) return { total: 0, cash: 0, card: 0, other: 0 };

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, payment_method')
    .eq('outlet_id', outletId)
    .eq('shift_id', shiftId);

  if (error) {
    throw new Error(`Failed to calculate balance: ${error.message}`);
  }

  return data.reduce((acc, txn) => {
    const val = parseFloat(txn.amount);
    const sign = txn.type === 'income' ? 1 : -1;
    const net = val * sign;

    acc.total += net;
    if (txn.payment_method === 'cash') acc.cash += net;
    else if (txn.payment_method === 'card') acc.card += net;
    else acc.other += net;

    return acc;
  }, { total: 0, cash: 0, card: 0, other: 0 });
}
