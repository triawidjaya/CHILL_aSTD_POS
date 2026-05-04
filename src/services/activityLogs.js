import { supabase } from './supabase';

// Log activity
export async function logActivity(outletId, userId, action, details = null) {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      outlet_id: outletId,
      user_id: userId,
      action,
      details: details || {},
      created_at: new Date().toISOString(),
    });

  if (error) throw new Error(`Failed to log activity: ${error.message}`);
}

// Fetch activity logs for outlet
export async function fetchActivityLogs(outletId, limit = 100, offset = 0) {
  const { data, error, count } = await supabase
    .from('activity_logs')
    .select('*,user:users(name,email)', { count: 'exact' })
    .eq('outlet_id', outletId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch activity logs: ${error.message}`);
  return { data, count };
}

// Subscribe to activity log changes
export function subscribeToActivityLogs(outletId, callback) {
  return supabase
    .channel(`activity-logs-${outletId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activity_logs',
        filter: `outlet_id=eq.${outletId}`,
      },
      callback
    )
    .subscribe();
}
