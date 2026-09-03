-- Diagnostics for the 42501 "violates row-level security policy" error.
-- Run this in Supabase -> SQL Editor and share the three result sets.

-- 1. Does the table exist, and is RLS on?
select
  n.nspname   as schema,
  c.relname   as table,
  c.relrowsecurity  as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relname = 'game_events';

-- 2. Which policies exist on it?
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename = 'game_events';

-- 3. What table privileges does the anon role actually have?
select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_name = 'game_events'
  and grantee in ('anon', 'authenticated', 'service_role')
order by grantee, privilege_type;
