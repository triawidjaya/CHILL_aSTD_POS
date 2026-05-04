# CHILL aSTD POS - SaaS Edition

## Phase 1 & 2 - Foundation Setup Complete ✅

This document summarizes the core architecture, setup, and next steps.

---

## Architecture Overview

### Tech Stack
- **Frontend:** React 18 + Vite
- **Backend:** Supabase (PostgreSQL + Auth)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Real-time:** Supabase subscriptions
- **Deployment:** Ready for Vercel

### Project Structure
```
src/
├── components/          # React components (future)
├── pages/              # Full-page components
│   ├── LoginPage.jsx   # Auth entry point
│   └── DashboardPage.jsx # Main dashboard (MVP)
├── hooks/              # Custom React hooks
│   ├── useTransactions.js
│   ├── useShifts.js
│   └── useUsers.js
├── services/           # Supabase API layer
│   ├── auth.js
│   ├── transactions.js
│   ├── shifts.js
│   ├── users.js
│   └── supabase.js
├── context/            # React context (auth)
│   └── AuthContext.jsx
├── utils/              # Utilities
│   └── formatting.js    # CSV export, currency formatting
└── styles/             # CSS modules
    ├── global.css
    ├── login.css
    └── dashboard.css

database/
├── schema.sql          # PostgreSQL schema with RLS policies
└── MIGRATION_STEPS.md  # Setup instructions
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- Supabase account created (free tier works)
- Git configured with credentials

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your credentials to `.env.local`:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 4. Initialize Database
1. In Supabase Dashboard, go to SQL Editor
2. Create new query
3. Copy entire content from `database/schema.sql`
4. Execute all statements
5. Verify tables are created

### 5. Enable Authentication
In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable "Email" provider
3. Disable "Email confirmations" (for MVP)

### 6. Run Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

---

## Features Implemented (Phase 1 & 2)

### Authentication ✅
- [x] Email/password registration for new outlets
- [x] Email/password login for managers
- [x] PIN-based login for staff (quick access)
- [x] Session persistence with Supabase auth
- [x] User profile sync

### Data Layer ✅
- [x] Supabase client integration
- [x] Real-time subscriptions (Firestore-like API)
- [x] Custom hooks for data fetching
- [x] Outlet isolation via RLS policies
- [x] Transactional CRUD operations

### Database ✅
- [x] Multi-tenant schema (outlets table)
- [x] User management with roles (Manager/Admin/Staff)
- [x] Transaction tracking with shift linking
- [x] Category management
- [x] Activity audit trail
- [x] Row Level Security on all tables
- [x] Foreign key relationships

### UI/UX ✅
- [x] Login page (email + PIN modes)
- [x] Dashboard page (MVP)
- [x] Global CSS variables for theming
- [x] Responsive design setup
- [x] Error handling & loading states

### Security ✅
- [x] RLS policies preventing cross-outlet access
- [x] Frontend auth state management
- [x] Protected routes (PrivateRoute component)
- [x] Session-based authentication

---

## Key Design Decisions

### 1. Real-time Data
All tables have Supabase subscriptions (like Firebase onSnapshot):
```javascript
const subscription = subscribeToTransactions(outletId, callback);
return () => subscription?.unsubscribe();
```

### 2. RLS Policies
Every query is automatically filtered by outlet:
```sql
CREATE POLICY "transactions_select" ON transactions
FOR SELECT USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);
```

### 3. Shift Management
- Shifts have OPEN/CLOSED status
- Transactions are **never deleted**, only archived by shift closure
- History is permanent and immutable

### 4. PIN Authentication
- Fast staff access without passwords
- Stored as hashed PIN in users table
- Still requires email/password for registration

---

## Current Limitations (Expected for MVP)

❌ No transaction editing UI (services ready, UI pending)
❌ No shift history view (services ready, UI pending)
❌ No CSV export (utility ready, button pending)
❌ No staff management UI (services ready, UI pending)
❌ No role-based UI visibility (context ready, components pending)
❌ No multi-language support yet (i18n package ready)
❌ No offline mode (can be added with service workers)

---

## Next Steps (Phase 3 - UI Migration)

### Dashboard Components
- [ ] Transaction form modal
- [ ] Transaction table with filters
- [ ] Balance cards (cash/card/other)
- [ ] Close shift modal with CSV export
- [ ] Start shift modal with initial cash

### Admin Pages
- [ ] Staff management (CRUD staff cards)
- [ ] System configuration (name, logo, categories)
- [ ] Shift history with export options
- [ ] User roles & permissions view

### Advanced Features
- [ ] Multi-language support (English/Indonesian)
- [ ] Bulk imports (CSV)
- [ ] Analytics dashboard
- [ ] Email notifications

---

## Testing Strategy

### Unit Tests
Already have test structure with Jest/Vitest
```bash
npm run test
```

### E2E Tests
Playwright tests ready for extension
```bash
npm run e2e
npm run e2e:ui
```

### Manual Testing
1. Create new outlet via registration
2. Login with email/password
3. Open shift
4. Add transactions
5. Close shift
6. Verify data persists
7. Login as different user - data should be isolated

---

## Deployment Checklist

- [ ] Update `.env.example` with final values
- [ ] Set environment variables in Vercel
- [ ] Test production build: `npm run build`
- [ ] Preview: `npm run preview`
- [ ] Deploy to Vercel

---

## API Reference

### useTransactions Hook
```javascript
const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } = useTransactions(outletId, shiftId);
```

### useShifts Hook
```javascript
const { activeShift, loading, error, openShift, closeCurrentShift } = useShifts(outletId);
```

### useUsers Hook
```javascript
const { users, loading, error, addUser, updateUserData, deleteUserData } = useUsers(outletId);
```

### useAuth Hook
```javascript
const { user, session, loading, userProfile, logout, isAuthenticated } = useAuth();
```

---

## Common Issues & Solutions

### Issue: "Missing environment variables"
**Solution:** Create `.env.local` with your Supabase credentials

### Issue: "RLS policy prevents access"
**Solution:** Ensure user is in `users` table with correct `outlet_id`

### Issue: "Real-time not updating"
**Solution:** Check if subscription is properly returned and unsubscribed

### Issue: "PIN login fails"
**Solution:** Verify PIN is stored in database (default is '0000')

---

## File Locations Reference

| File | Purpose |
|------|---------|
| `src/services/auth.js` | Authentication functions |
| `src/services/transactions.js` | Transaction CRUD |
| `src/services/shifts.js` | Shift management |
| `src/services/users.js` | User management |
| `src/hooks/useTransactions.js` | Transaction state hook |
| `src/hooks/useShifts.js` | Shift state hook |
| `src/hooks/useUsers.js` | User state hook |
| `src/context/AuthContext.jsx` | Auth context provider |
| `src/pages/LoginPage.jsx` | Login component |
| `src/pages/DashboardPage.jsx` | Dashboard component |
| `database/schema.sql` | PostgreSQL schema |

---

## Support

For migration questions or issues:
1. Check `database/MIGRATION_STEPS.md`
2. Review Supabase documentation
3. Check service functions for API patterns
4. Verify RLS policies in Supabase dashboard

---

**Status:** Phase 1 & 2 Complete ✅
**Next Phase:** Phase 3 - UI Migration & Component Building
