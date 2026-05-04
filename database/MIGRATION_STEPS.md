-- ============================================================
-- CHILL aSTD POS - Migration Guide
-- ============================================================

-- 1. Copy the schema.sql content and paste into Supabase SQL Editor
-- 2. Execute all statements
-- 3. Configure authentication in Supabase Dashboard:
--    - Enable Email/Password authentication
--    - Set up email confirmation (optional for MVP)
-- 4. Update .env.local with your Supabase credentials:
--    VITE_SUPABASE_URL=your_project_url
--    VITE_SUPABASE_ANON_KEY=your_anon_key

-- Optional: Add auth.users trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Note: This requires a function handle_new_user() to be defined
-- For MVP, users are created manually through the API
