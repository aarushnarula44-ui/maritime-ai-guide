-- ============================================================
-- MAKE FIRST ADMIN USER
-- ============================================================
-- Instructions:
-- 1. Go to Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- 2. Replace YOUR_EMAIL_HERE with your actual email address
-- 3. Run this query
-- 4. Sign out of the platform and sign back in
-- 5. You can now access /admin
-- ============================================================

UPDATE public.profiles
SET role = 'super_admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'YOUR_EMAIL_HERE'
);

-- Verify it worked:
-- SELECT id, email, role FROM auth.users
-- JOIN public.profiles ON profiles.id = auth.users.id
-- WHERE auth.users.email = 'YOUR_EMAIL_HERE';
