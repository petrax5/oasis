-- ============================================================
-- 002_change_log.sql — activity log + undo for the admin panel
-- ============================================================
-- WHEN TO RUN: only on databases that already ran the base
-- schema.sql. (Fresh installs get this table from schema.sql.)
--
--   Supabase dashboard -> your project -> SQL Editor -> New query
--   -> paste this file -> Run (or press Cmd/Ctrl+Enter).
--
-- SAFE TO RE-RUN: CREATE TABLE IF NOT EXISTS and
-- DROP POLICY IF EXISTS before CREATE POLICY.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists change_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_email text,
  entity text not null,
  entity_label text,
  record_id text,
  action text not null check (action in ('create','update','delete')),
  field_name text,
  old_value text,
  new_value text,
  old_row jsonb,
  new_row jsonb,
  undone boolean default false
);

create index if not exists idx_change_log_created on change_log (created_at desc);

alter table change_log enable row level security;

drop policy if exists "change_log_authenticated_all" on change_log;
create policy "change_log_authenticated_all" on change_log
  for all to authenticated using (true) with check (true);
