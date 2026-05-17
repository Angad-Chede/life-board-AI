-- ============================================================
-- LifeBoard AI — Fix habits table: add missing columns
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Add missing columns (IF NOT EXISTS prevents errors if some already exist)
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS completed_today boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_completed   date,
  ADD COLUMN IF NOT EXISTS weekly_log       jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS streak           integer NOT NULL DEFAULT 0;

-- Reload schema cache (sometimes needed after ALTER TABLE)
NOTIFY pgrst, 'reload schema';
