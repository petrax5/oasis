-- Theme manager storage for the admin panel (003).
-- Run in Supabase SQL Editor: paste and Run.
alter table site_settings add column if not exists theme jsonb default '{}'::jsonb;
