-- Inbox status workflow for the admin panel (004).
-- Run in Supabase SQL Editor: paste and Run. Safe to run more than once.
--
-- Adds a `status` column ('new' | 'read' | 'pending' | 'finished') and a
-- `finished_at` timestamp to both inbox tables, so the admin can mark items
-- as read / pending / finished and reopen finished ones.
-- Existing rows keep working: anything already marked read becomes 'read',
-- everything else stays 'new'. A trigger keeps the legacy `read` flag in
-- sync, so older admin versions and the website's inserts keep behaving.

alter table appointments add column if not exists status text default 'new';
alter table appointments add column if not exists finished_at timestamptz;

alter table contact_messages add column if not exists status text default 'new';
alter table contact_messages add column if not exists finished_at timestamptz;

-- Backfill: map the old read flag onto the new status.
update appointments
set status = 'read'
where coalesce(read, false) = true and coalesce(status, 'new') = 'new';

update contact_messages
set status = 'read'
where coalesce(read, false) = true and coalesce(status, 'new') = 'new';

-- Keep `read` in sync with `status`, and stamp / clear `finished_at`
-- automatically so direct SQL edits behave like the admin UI.
create or replace function sync_inbox_read() returns trigger as $$
begin
  new.read := (new.status is distinct from 'new');
  if new.status = 'finished' then
    if new.finished_at is null then
      new.finished_at := now();
    end if;
  else
    new.finished_at := null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_inbox_status_appt on appointments;
create trigger trg_inbox_status_appt
  before insert or update on appointments
  for each row execute function sync_inbox_read();

drop trigger if exists trg_inbox_status_msg on contact_messages;
create trigger trg_inbox_status_msg
  before insert or update on contact_messages
  for each row execute function sync_inbox_read();
