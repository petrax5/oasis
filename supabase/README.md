# Supabase — database for the Oasis site

This folder owns everything about the Supabase backend. Two files:

- **`schema.sql`** — the one script that builds the whole database: tables, indexes, storage buckets, row-level-security policies, and the initial seed data.
- **`README.md`** — this file.

## How to run it (one time, by the site owner)

1. Open the **Supabase dashboard** and pick the Oasis project.
2. In the left sidebar click **SQL Editor**.
3. Click **New query**.
4. Open `supabase/schema.sql` in this repo, copy the entire file, and paste it into the query editor.
5. Click **Run** (or press Cmd/Ctrl+Enter).

That is the whole setup. No CLI, no migrations tool, no manual table creation.

## What the script does

- **Tables (9):** `products`, `brands`, `services`, `packages`, `testimonials`, `social_links`, `site_settings` (content, all readable publicly), plus `appointments` and `contact_messages` (form submissions — empty until visitors use the forms).
- **Indexes:** `products(brand)` for fast brand filtering.
- **Storage buckets:** `product-images` and `site-assets`, both public-read — created by the SQL itself, you do not need to create them in the dashboard first.
- **Row Level Security:** enabled on all 9 tables and enforced via policies (see below).
- **Seed data:** every row migrated from the old `content/*.json` files:
  - 73 products, 7 brands, 4 services, 6 packages, 3 testimonials, 5 social links
  - 1 `site_settings` row merging `content/settings.json` + `content/footer.json` (hours, phones, address, verse, copyright, …)

## Re-running is safe

The script is idempotent-ish by design: `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS` before every `CREATE POLICY`, and `ON CONFLICT DO NOTHING` on every seed insert. Content rows use deterministic IDs (same input → same ID), so running the file twice does **not** duplicate anything. It never truncates or deletes data.

After running, sanity-check with the queries in the comment at the bottom of `schema.sql` (expect 73 / 7 / 4 / 6 / 3 / 5 / 1 rows).

## RLS summary

- **Public (anon key):**
  - `SELECT` on the 7 content tables: `products`, `brands`, `services`, `packages`, `testimonials`, `social_links`, `site_settings`.
  - `INSERT` only on `appointments` and `contact_messages` (so visitors can submit the appointment and contact forms — but cannot read anyone else's submissions).
- **Authenticated (logged-in admin):** full access (`ALL`) on all 9 tables — this powers the admin inbox (read/update submissions, edit content).
- **Storage:** anyone can read both buckets (`product-images`, `site-assets`); only authenticated users can upload, update, or delete files.

## ⚠️ Keys

The **anon key stays public-by-design** — it is meant to live in client-side code, gated by the RLS policies above. It is added later to `js/config.js` **by the site owner**, directly in their own checkout. **Never commit keys to this repo** — no project URLs, no project refs, no anon/service keys in any file.

## Migrations (for databases that already ran schema.sql)

`schema.sql` is the full setup for a fresh database. If the database was
already created from an earlier version, run only the new migration files
in `supabase/migrations/` in numeric order — each one is safe to re-run:

- **`002_change_log.sql`** — adds the `change_log` table that powers the
  admin's "Recent changes" tab and its undo buttons. Run it once in the
  SQL editor (paste the file, Run). Until it runs, the Activity tab shows
  a reminder instead of the log.
