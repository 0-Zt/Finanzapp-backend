-- Budget enhancements: month-based budgets, rollover, and profile settings

-- Add profile settings
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS budget_warning_threshold INTEGER DEFAULT 80,
  ADD COLUMN IF NOT EXISTS budget_exceeded_threshold INTEGER DEFAULT 100;

-- Add month and rollover to category budgets
ALTER TABLE category_budgets
  ADD COLUMN IF NOT EXISTS budget_month DATE DEFAULT (date_trunc('month', now())::date),
  ADD COLUMN IF NOT EXISTS rollover_enabled BOOLEAN DEFAULT FALSE;

-- Backfill budget_month when missing
UPDATE category_budgets
SET budget_month = date_trunc('month', COALESCE(created_at, now()))::date
WHERE budget_month IS NULL;

-- Replace unique constraint to include month
ALTER TABLE category_budgets DROP CONSTRAINT IF EXISTS unique_user_category_budget;
ALTER TABLE category_budgets
  ADD CONSTRAINT unique_user_category_budget_month UNIQUE (user_id, category_id, budget_month);

-- Index for month lookups
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_month ON category_budgets(user_id, budget_month);
