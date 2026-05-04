-- ============================================================
-- CHILL aSTD POS - PostgreSQL Schema
-- Multi-tenant SaaS architecture with Row Level Security (RLS)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Core Tables
-- ============================================================

-- Clean up existing tables before creating them (useful for fresh setups)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS outlets CASCADE;

-- OUTLETS (SaaS Tenants)
CREATE TABLE outlets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USERS (with role per outlet)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  pin TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Manager', 'Admin', 'Staff')),
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outlet_id, email),
  UNIQUE(outlet_id, pin)
);

-- CATEGORIES (income/expense types)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outlet_id, name)
);

-- SHIFTS (work periods - never delete)
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
  initial_cash DECIMAL(15,2) DEFAULT 0,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRANSACTIONS (permanent record, linked to shifts)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'other')),
  description TEXT,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY LOGS (audit trail)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- OUTLETS: Users can only see their own outlet
CREATE POLICY "outlets_select" ON outlets
FOR SELECT USING (
  id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- USERS: Can only see users in their outlet
CREATE POLICY "users_select" ON users
FOR SELECT USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- USERS: Managers can insert users into their outlet
CREATE POLICY "users_insert" ON users
FOR INSERT WITH CHECK (
  outlet_id IN (
    SELECT outlet_id FROM users 
    WHERE id = auth.uid() AND role IN ('Manager', 'Admin')
  )
);

-- USERS: Can update own profile or managers can update outlet users
CREATE POLICY "users_update" ON users
FOR UPDATE USING (
  id = auth.uid() OR
  outlet_id IN (
    SELECT outlet_id FROM users 
    WHERE id = auth.uid() AND role IN ('Manager', 'Admin')
  )
);

-- USERS: Managers can delete users from their outlet (except themselves)
CREATE POLICY "users_delete" ON users
FOR DELETE USING (
  outlet_id IN (
    SELECT outlet_id FROM users 
    WHERE id = auth.uid() AND role IN ('Manager', 'Admin')
  )
  AND id != auth.uid()
);

-- CATEGORIES: Can only see categories in their outlet
CREATE POLICY "categories_select" ON categories
FOR SELECT USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- CATEGORIES: Managers can insert categories
CREATE POLICY "categories_insert" ON categories
FOR INSERT WITH CHECK (
  outlet_id IN (
    SELECT outlet_id FROM users 
    WHERE id = auth.uid() AND role IN ('Manager', 'Admin')
  )
);

-- CATEGORIES: Managers can update categories in their outlet
CREATE POLICY "categories_update" ON categories
FOR UPDATE USING (
  outlet_id IN (
    SELECT outlet_id FROM users 
    WHERE id = auth.uid() AND role IN ('Manager', 'Admin')
  )
);

-- SHIFTS: Can only see shifts in their outlet
CREATE POLICY "shifts_select" ON shifts
FOR SELECT USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- SHIFTS: Can create shifts in their outlet
CREATE POLICY "shifts_insert" ON shifts
FOR INSERT WITH CHECK (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- SHIFTS: Can update shifts in their outlet
CREATE POLICY "shifts_update" ON shifts
FOR UPDATE USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- TRANSACTIONS: Can only see transactions in their outlet
CREATE POLICY "transactions_select" ON transactions
FOR SELECT USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- TRANSACTIONS: Can create transactions in their outlet
CREATE POLICY "transactions_insert" ON transactions
FOR INSERT WITH CHECK (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- TRANSACTIONS: Can update own transactions (Staff) or any in their outlet (Manager)
CREATE POLICY "transactions_update" ON transactions
FOR UPDATE USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- TRANSACTIONS: Can delete own transactions (Staff) or any in their outlet (Manager)
CREATE POLICY "transactions_delete" ON transactions
FOR DELETE USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- ACTIVITY_LOGS: Can only see logs from their outlet
CREATE POLICY "activity_logs_select" ON activity_logs
FOR SELECT USING (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- ACTIVITY_LOGS: Can insert logs for their outlet
CREATE POLICY "activity_logs_insert" ON activity_logs
FOR INSERT WITH CHECK (
  outlet_id IN (
    SELECT outlet_id FROM users WHERE id = auth.uid()
  )
);

-- ============================================================
-- Indexes for Performance
-- ============================================================

CREATE INDEX idx_users_outlet ON users(outlet_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_categories_outlet ON categories(outlet_id);
CREATE INDEX idx_shifts_outlet ON shifts(outlet_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_opened ON shifts(opened_at DESC);
CREATE INDEX idx_transactions_outlet ON transactions(outlet_id);
CREATE INDEX idx_transactions_shift ON transactions(shift_id);
CREATE INDEX idx_transactions_date ON transactions(created_at DESC);
CREATE INDEX idx_activity_logs_outlet ON activity_logs(outlet_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at DESC);
