-- ============================================================
-- FINANZAPP: Authentication & User Profile Setup
-- Execute this script ONCE in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. Create user_profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  monthly_salary DECIMAL(12, 2) DEFAULT 0,
  salary_day INTEGER DEFAULT 1 CHECK (salary_day >= 1 AND salary_day <= 31),
  currency TEXT DEFAULT 'CLP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. Create fixed_expenses table
-- ============================================================
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
  due_day INTEGER DEFAULT 1 CHECK (due_day >= 1 AND due_day <= 31),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. Modify existing tables to use UUID for user_id
-- ============================================================

-- 3a. Clear existing data (required for column type change)
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE upcoming_payments CASCADE;
TRUNCATE TABLE financial_goals CASCADE;

-- 3b. Alter transactions table
ALTER TABLE transactions
  DROP COLUMN IF EXISTS user_id;
ALTER TABLE transactions
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3c. Alter upcoming_payments table
ALTER TABLE upcoming_payments
  DROP COLUMN IF EXISTS user_id;
ALTER TABLE upcoming_payments
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3d. Alter financial_goals table
ALTER TABLE financial_goals
  DROP COLUMN IF EXISTS user_id;
ALTER TABLE financial_goals
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- 4. Enable Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. Create RLS Policies
-- ============================================================

-- Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for fixed_expenses
DROP POLICY IF EXISTS "Users can view own fixed expenses" ON fixed_expenses;
CREATE POLICY "Users can view own fixed expenses" ON fixed_expenses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fixed expenses" ON fixed_expenses;
CREATE POLICY "Users can insert own fixed expenses" ON fixed_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own fixed expenses" ON fixed_expenses;
CREATE POLICY "Users can update own fixed expenses" ON fixed_expenses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own fixed expenses" ON fixed_expenses;
CREATE POLICY "Users can delete own fixed expenses" ON fixed_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for upcoming_payments
DROP POLICY IF EXISTS "Users can view own upcoming payments" ON upcoming_payments;
CREATE POLICY "Users can view own upcoming payments" ON upcoming_payments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own upcoming payments" ON upcoming_payments;
CREATE POLICY "Users can insert own upcoming payments" ON upcoming_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own upcoming payments" ON upcoming_payments;
CREATE POLICY "Users can update own upcoming payments" ON upcoming_payments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own upcoming payments" ON upcoming_payments;
CREATE POLICY "Users can delete own upcoming payments" ON upcoming_payments
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for financial_goals
DROP POLICY IF EXISTS "Users can view own financial goals" ON financial_goals;
CREATE POLICY "Users can view own financial goals" ON financial_goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own financial goals" ON financial_goals;
CREATE POLICY "Users can insert own financial goals" ON financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own financial goals" ON financial_goals;
CREATE POLICY "Users can update own financial goals" ON financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own financial goals" ON financial_goals;
CREATE POLICY "Users can delete own financial goals" ON financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Keep expense_categories readable by all authenticated users (default categories)
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view categories" ON expense_categories;
CREATE POLICY "Authenticated users can view categories" ON expense_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. Create trigger to auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. Create indexes for better performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_id ON fixed_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_payments_user_id ON upcoming_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);

-- ============================================================
-- Done! The authentication system is now configured.
-- ============================================================
