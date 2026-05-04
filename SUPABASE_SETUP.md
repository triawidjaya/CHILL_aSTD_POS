# Supabase Setup Guide

This guide walks you through creating a Supabase account, setting up a new project, and deploying the database schema.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Sign Up"** in the top right corner
3. Choose your preferred sign-up method:
   - **Email**: Enter email and password
   - **GitHub**: Sign in with GitHub account (recommended)
   - **Google**: Sign in with Google account

4. Verify your email if using email/password signup
5. You'll be redirected to the Supabase dashboard

## Step 2: Create a New Project

1. In the Supabase dashboard, click **"New project"** button
2. Fill in the project details:
   - **Name**: Enter `chill-astd-pos` (or your preferred name)
   - **Database Password**: Enter a strong password (save this securely)
   - **Region**: Select closest to your location (e.g., `us-east-1` for North America)
   - **Pricing Plan**: Select **Free** tier (includes 500MB database + 2GB file storage)

3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to initialize

## Step 3: Get Your API Credentials

Once the project initializes:

1. Go to **Settings** → **API** (in the left sidebar under "Project Settings")
2. You'll see two keys you need to copy:
   - **Project URL** (under "Project API keys")
   - **Anon Public Key** (under "Project API keys" → "anon")

**Example:**
```
Project URL: https://abcdefghijklmnop.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Create `.env.local` File

1. In VS Code, right-click on the workspace root folder (d:\CHILL_aSTD_POS)
2. Select **"New File"**
3. Name it `.env.local`
4. Paste the following, replacing with YOUR credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example (DO NOT use these values):**
```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwNDc0OTYwMCwiZXhwIjoxODYyNTE1NjAwfQ.5JfQ_fVK7GzQ_5r6JK_5K6L7M8N9O0P1Q2R3S4T5U6
```

5. Save the file (Ctrl+S)

## Step 5: Deploy Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `d:\CHILL_aSTD_POS\database\schema.sql` in your editor
4. Copy the entire contents (Ctrl+A → Ctrl+C)
5. Paste into the Supabase SQL Editor query window
6. Click **"Run"** button (or press Ctrl+Enter)
7. Wait for completion - you should see **"Success"** messages for each table

**Tables created:**
- `outlets` — Business locations
- `users` — Staff members
- `categories` — Income/expense categories
- `shifts` — Work shifts
- `transactions` — Sales/expenses
- `activity_logs` — Audit trail

## Step 6: Enable Row Level Security (RLS)

Supabase creates RLS policies automatically when you run the schema. Verify they're enabled:

1. Go to **Authentication** → **Policies** (left sidebar)
2. For each table (outlets, users, categories, shifts, transactions, activity_logs):
   - Click the table name
   - Verify **RLS is enabled** (green toggle)
   - Verify policies exist (should see `select`, `insert`, `update`, `delete` policies)

## Step 7: Test Authentication

1. Go back to **SQL Editor**
2. Run a quick test query:

```sql
SELECT * FROM outlets LIMIT 1;
```

If this runs without error, your database connection works!

## Step 8: Start Development Server

1. Open terminal in VS Code (Ctrl+`)
2. Run:

```bash
npm install
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173)
4. You should see the **Login Page**

## Step 9: Test the App

1. **Register a new outlet:**
   - Click **"Register"** tab
   - Fill in: Outlet Name, Email, Password
   - Click **"Create Account"**
   - Should redirect to dashboard

2. **Test with PIN login:**
   - After registering, you can create staff with PINs
   - Use PIN tab to login as staff member

## Troubleshooting

### "Connection refused" error
- **Cause:** `.env.local` not found or credentials invalid
- **Fix:** Check file exists in workspace root, verify URL and key copied correctly

### "Invalid API key" error
- **Cause:** Anon key is incorrect
- **Fix:** Copy anon key again from Settings → API in Supabase dashboard

### Tables not created
- **Cause:** Schema.sql didn't run completely
- **Fix:** Check for SQL errors in the Supabase SQL Editor output, run again

### Can't sign up/login
- **Cause:** Auth policies may be disabled
- **Fix:** Go to Authentication → Policies, ensure all are enabled

### Real-time updates not working
- **Cause:** Realtime is disabled for the database
- **Fix:** Go to Settings → Realtime, ensure it's enabled

## Free Tier Limits

- **Database:** 500MB storage
- **File storage:** 2GB
- **Auth users:** Unlimited
- **Real-time connections:** 100 concurrent

For development and small deployments, the Free tier is sufficient.

## Next Steps

After completing setup:

1. Test the full authentication flow (PIN, Email, Register)
2. Verify dashboard loads and can create transactions
3. Test real-time updates (open app in two browser tabs)
4. Test export CSV functionality
5. Run E2E tests: `npm run test:e2e`

See [SETUP.md](SETUP.md) for full project documentation.
