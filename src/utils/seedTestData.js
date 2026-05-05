import { supabase } from '../services/supabase';
import { registerOutlet } from '../services/auth';

/**
 * SEED TEST DATA
 * This script creates a test outlet and a manager for rapid testing.
 * IMPORTANT: Use only in development/testing environments.
 */
export async function seedTestData() {
  const testEmail = 'manager@pipespos.com';
  const testPassword = 'Password123!';
  const testOutletName = 'Test Hospitality POS';

  console.log('--- Starting Seeding Process ---');

  try {
    // 1. Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .maybeSingle();

    if (existingUser) {
      console.log('Test user already exists. Skipping registration.');
      return { success: true, message: 'User already exists', userId: existingUser.id };
    }

    // 2. Register Outlet and Manager
    console.log(`Registering outlet: ${testOutletName} with manager: ${testEmail}`);
    const result = await registerOutlet(testEmail, testPassword, testOutletName);
    
    console.log('Seeding successful!', result);
    return { success: true, ...result };

  } catch (error) {
    console.error('Seeding failed:', error.message);
    return { success: false, error: error.message };
  }
}
