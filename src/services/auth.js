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
export async function registerOutlet(email, password, outletName) {
  // 1. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(`Auth error: ${authError.message}`);
  }

  const userId = authData.user.id;

  // 2. Create outlet
  const { data: outletData, error: outletError } = await supabase
    .from('outlets')
    .insert({
      name: outletName,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (outletError) {
    throw new Error(`Failed to create outlet: ${outletError.message}`);
  }

  const outletId = outletData.id;

  // 3. Create user profile (Manager role)
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      outlet_id: outletId,
      email,
      role: 'Manager',
      status: 'Active',
      pin: '0000', // Default PIN
      created_at: new Date().toISOString(),
    });

  if (userError) {
    throw new Error(`Failed to create user: ${userError.message}`);
  }

  // 4. Create default categories
  const defaultCategories = [
    { name: 'Accommodation', type: 'income' },
    { name: 'F&B Sales', type: 'income' },
    { name: 'Supplies', type: 'expense' },
    { name: 'Maintenance', type: 'expense' },
  ];

  const categories = defaultCategories.map(cat => ({
    outlet_id: outletId,
    ...cat,
    created_at: new Date().toISOString(),
  }));

  const { error: catError } = await supabase
    .from('categories')
    .insert(categories);

  if (catError) {
    console.warn('Failed to create default categories:', catError);
  }

  return { userId, outletId };
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
