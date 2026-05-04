# Quick Start Guide - CHILL aSTD POS SaaS

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Create a new project (choose free tier)
4. Wait for project initialization (~2 minutes)

### 3. Set Up Database
1. In Supabase dashboard, open SQL Editor
2. Create new query
3. Copy all content from `database/schema.sql`
4. Run the query
5. ✅ Tables created with RLS policies

### 4. Configure Environment
1. Copy `.env.local.example` to `.env.local`
2. In Supabase, go to Settings → API
3. Copy your project URL and Anon Key
4. Update `.env.local` with these values

### 5. Enable Email Auth
1. In Supabase Dashboard: Authentication → Providers
2. Find "Email" provider
3. Turn it ON
4. Disable "Confirm email" (for MVP simplicity)

### 6. Run the App
```bash
npm run dev
```

App opens at http://localhost:3000

---

## Test the Setup

### Register New Outlet
1. Click "Create New Outlet"
2. Enter:
   - Business Name: "My Test Hostel"
   - Email: "admin@test.com"
   - Password: "test1234"
3. ✅ Outlet created, first user is Manager

### Login & Test Shift
1. Login with your email/password
2. Click "Start New Shift"
3. ✅ Active shift created
4. Close shift (creates CSV data)

### Test PIN Login (Optional)
1. Default PIN is: `0000`
2. Try PIN login mode on login page
3. ✅ Quick staff access works

---

## Verify Database Isolation

### Test 1: User can only see their outlet
1. Create 2 outlets (register twice with different emails)
2. Login to first outlet
3. Verify you only see your data
4. Logout, login to second outlet
5. ✅ Data is completely isolated (RLS working)

### Test 2: Transactions are permanent
1. Create shift, add transaction, close shift
2. Check `shifts` table status = CLOSED
3. Verify transaction still exists in `transactions` table
4. ✅ No data loss (immutable history)

---

## What's Ready

### ✅ Foundation Complete
- PostgreSQL multi-tenant schema
- Row Level Security (RLS) on all tables
- Real-time sync via Supabase subscriptions
- React hooks for data management
- Auth context for session handling
- Login page with email/PIN modes
- Dashboard page (MVP)

### ⏳ Next: Build the UI (Phase 3)
- Transaction form modal
- Transaction table with filters
- Close shift with CSV export
- Staff management
- History view
- Admin configuration panel

---

## Troubleshooting

### "Missing environment variables"
```bash
# Create .env.local with:
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### "Tables don't exist"
1. Go to Supabase SQL Editor
2. Paste `database/schema.sql` content
3. Click "RUN"
4. Wait for completion

### "RLS policy prevents read"
1. Verify user exists in `users` table
2. Check user has correct `outlet_id`
3. Check auth.uid() matches user.id

### "Real-time not updating"
- Real-time is set up, UI just needs to subscribe
- Check browser console for errors
- Verify Supabase project is active

---

## Next Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run E2E tests
npm run e2e

# Lint code
npm run lint
```

---

## Architecture at a Glance

```
App (React)
  ↓
AuthContext (User session)
  ↓
Custom Hooks (useTransactions, useShifts, useUsers)
  ↓
Services (Supabase client calls)
  ↓
Supabase (Auth + Real-time subscriptions)
  ↓
PostgreSQL (RLS enforced)
```

Every query is filtered by outlet via RLS policies.

---

## Key Endpoints Ready

### Authentication
- `registerOutlet(email, password, businessName)` - Create new outlet
- `loginWithEmail(email, password)` - Login manager
- `authenticateWithPin(pin)` - Quick staff access

### Transactions
- `addTransaction(outletId, data)` - Create transaction
- `updateTransaction(id, updates)` - Modify transaction
- `deleteTransaction(id)` - Remove transaction
- `fetchTransactions(outletId, shiftId)` - Get all

### Shifts
- `createShift(outletId, userId, initialCash)` - Start shift
- `closeShift(shiftId, outletId)` - Close & archive
- `getActiveShift(outletId)` - Get current shift

### Users
- `addUserToOutlet(outletId, userData)` - Add staff
- `updateUser(userId, updates)` - Modify user
- `fetchOutletUsers(outletId)` - Get all users

---

## Ready for Production

Phase 1 & 2 foundation is production-ready:
- ✅ Supabase handles scaling
- ✅ RLS prevents data breaches
- ✅ Real-time sync is reliable
- ✅ Auth is secure & scalable
- ✅ Database structure supports future features

You can deploy to Vercel anytime. Just set environment variables in Vercel dashboard.

---

**Build Phase 3 next:** UI components for transactions, shifts, staff management, and reports.
