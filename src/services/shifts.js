import { supabase } from './supabase';

export async function getActiveShift(outletId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('outlet_id', outletId)
    .eq('status', 'OPEN')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch active shift: ${error.message}`);
  }

  return data;
}

export async function openShift(outletId, initialCash, userId) {
  // 1. Double check if there's already an open shift
  const active = await getActiveShift(outletId);
  if (active) {
    throw new Error('A shift is already open for this outlet.');
  }

  // 2. Create the shift
  const { data: shift, error: shiftError } = await supabase
    .from('shifts')
    .insert({
      outlet_id: outletId,
      status: 'OPEN',
      initial_cash: initialCash,
      created_by_user_id: userId,
      opened_at: new Date().toISOString()
    })
    .select()
    .single();

  if (shiftError) {
    throw new Error(`Failed to open shift: ${shiftError.message}`);
  }

  // 3. Add initial balance transaction
  if (initialCash > 0) {
    const { error: trxError } = await supabase
      .from('transactions')
      .insert({
        outlet_id: outletId,
        shift_id: shift.id,
        amount: initialCash,
        type: 'income',
        payment_method: 'cash',
        description: 'Initial drawer float',
        created_by_user_id: userId
      });

    if (trxError) {
      console.warn('Shift opened but initial balance transaction failed:', trxError);
    }
  }

  return shift;
}

export async function closeShift(shiftId, finalBalance = null) {
  const { data, error } = await supabase
    .from('shifts')
    .update({
      status: 'CLOSED',
      closed_at: new Date().toISOString(),
      // final_balance could be tracked if added to schema
    })
    .eq('id', shiftId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to close shift: ${error.message}`);
  }

  return data;
}

export async function getShiftHistory(outletId) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('outlet_id', outletId)
    .order('opened_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch shift history: ${error.message}`);
  }

  return data;
}
