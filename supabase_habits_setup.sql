-- ============================================================
-- LifeBoard AI — Habits Table Setup
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  streak          integer NOT NULL DEFAULT 0,
  completed_today boolean NOT NULL DEFAULT false,
  last_completed  date,
  weekly_log      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — users can only access their own rows

-- SELECT: users can read their own habits
CREATE POLICY "habits_select_own"
  ON public.habits
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: users can insert their own habits
CREATE POLICY "habits_insert_own"
  ON public.habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can update their own habits
CREATE POLICY "habits_update_own"
  ON public.habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can delete their own habits
CREATE POLICY "habits_delete_own"
  ON public.habits
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Index for fast per-user queries
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON public.habits (user_id);
