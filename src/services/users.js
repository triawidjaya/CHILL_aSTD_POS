import { supabase } from './supabase';

// Fetch all users in outlet
export async function fetchOutletUsers(outletId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('outlet_id', outletId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);
  return data;
}

// Add user to outlet
export async function addUserToOutlet(outletId, userData) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      outlet_id: outletId,
      created_at: new Date().toISOString(),
      ...userData,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add user: ${error.message}`);
  return data;
}

// Update user
export async function updateUser(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update user: ${error.message}`);
  return data;
}

// Delete user
export async function deleteUser(userId) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw new Error(`Failed to delete user: ${error.message}`);
}

// Get outlet details
export async function getOutletDetails(outletId) {
  const { data, error } = await supabase
    .from('outlets')
    .select('*')
    .eq('id', outletId)
    .single();

  if (error) throw new Error(`Failed to get outlet: ${error.message}`);
  return data;
}

// Update outlet settings
export async function updateOutletSettings(outletId, settings) {
  const { data, error } = await supabase
    .from('outlets')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', outletId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update outlet: ${error.message}`);
  return data;
}

// Subscribe to users change (using Channel API v2)
export function subscribeToUsers(outletId, callback) {
  return supabase
    .channel(`users-${outletId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `outlet_id=eq.${outletId}`,
      },
      callback
    )
    .subscribe();
}
