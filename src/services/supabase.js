import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get current user's outlet
export async function getCurrentUserOutlet() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: userProfile, error } = await supabase
    .from('users')
    .select('outlet_id')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Failed to get outlet:', error);
    return null;
  }

  return userProfile?.outlet_id;
}

// Helper to check user role
export async function getCurrentUserRole() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Failed to get role:', error);
    return null;
  }

  return userProfile?.role;
}

// Subscribe to real-time changes (using Channel API v2)
export function subscribeToTransactions(outletId, callback) {
  return supabase
    .channel(`transactions-${outletId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `outlet_id=eq.${outletId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToShifts(outletId, callback) {
  return supabase
    .channel(`shifts-${outletId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'shifts',
        filter: `outlet_id=eq.${outletId}`,
      },
      callback
    )
    .subscribe();
}
