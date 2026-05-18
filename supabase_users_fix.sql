-- ============================================================
-- LifeBoard AI — Fix users table: update focus_style check constraint
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Drop the old restrictive check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_focus_style_check;

-- 2. Add the corrected check constraint that allows all 3 focus styles
ALTER TABLE public.users 
  ADD CONSTRAINT users_focus_style_check 
  CHECK (focus_style IN ('pomodoro', 'flow', 'timeboxing'));

-- 3. Reload PostgREST schema cache so changes take effect immediately
NOTIFY pgrst, 'reload schema';
