-- RLS Verification Tests
-- Run these as different users to verify row-level security policies.
-- Each block should return 0 rows or an error when run as the wrong user.

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. User A cannot read User B's academic_profiles
-- ──────────────────────────────────────────────────────────────────────────────
-- Login as User A, then run:
-- SELECT * FROM academic_profiles WHERE user_id = '<user_b_id>';
-- Expected: 0 rows

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. User A cannot read User B's ai_messages
-- ──────────────────────────────────────────────────────────────────────────────
-- Login as User A, then run:
-- SELECT * FROM ai_messages WHERE user_id = '<user_b_id>';
-- Expected: 0 rows

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. User A cannot read User B's eligibility_checks
-- ──────────────────────────────────────────────────────────────────────────────
-- Login as User A, then run:
-- SELECT * FROM eligibility_checks WHERE user_id = '<user_b_id>';
-- Expected: 0 rows

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. Regular user cannot read admin_audit_log
-- ──────────────────────────────────────────────────────────────────────────────
-- Login as a non-admin user, then run:
-- SELECT * FROM admin_audit_log LIMIT 1;
-- Expected: 0 rows or permission denied

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. Regular user cannot update knowledge_base
-- ──────────────────────────────────────────────────────────────────────────────
-- Login as a non-admin user, then run:
-- UPDATE knowledge_base SET title = 'hacked' WHERE id = (SELECT id FROM knowledge_base LIMIT 1);
-- Expected: 0 rows updated or permission denied

-- ──────────────────────────────────────────────────────────────────────────────
-- Automated checks using pg_policies (run as service role to inspect)
-- ──────────────────────────────────────────────────────────────────────────────

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify RLS is enabled on critical tables
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relname IN (
    'profiles',
    'academic_profiles',
    'ai_messages',
    'ai_sessions',
    'eligibility_checks',
    'admin_audit_log',
    'knowledge_base',
    'saved_colleges',
    'saved_courses'
  )
ORDER BY relname;
