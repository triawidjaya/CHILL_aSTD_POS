import { supabase } from './supabase';

// PIN Authentication (for staff quick access)
export async function authenticateWithPin(pin) {
  const { data, error } = await supabase
    .from('users')
    .select('id, outlet_id, name, role, status')
    .eq('pin', pin)
    .eq('status', 'Active')
    .limit(1)
    .single();

  if (error) {
    throw new Error('Invalid PIN');
  }

  return data;
}

// Email/Password Registration (for first outlet user)
// Email/Password Registration (for first outlet user)
export async function registerOutlet(email, password, outletName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: outletName // This is picked up by the handle_new_user trigger
      }
    }
  });

  if (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }

  return data;
}

// Email/Password Login
export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Login failed: ${error.message}`);
  }

  return data;
}

// Logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

// Get current session
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Failed to get session: ${error.message}`);
  }
  return session;
}

// Subscribe to auth changes
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}
