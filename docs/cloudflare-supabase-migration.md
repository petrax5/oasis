# Migration plan: Netlify + Sveltia → Cloudflare Pages + Supabase

## Goal
Move the Oasis site off Netlify onto Jesus's Cloudflare account (Pages, free) with
Supabase as the content + forms backend and a custom /admin/ UI. The live site
(main → Netlify) stays untouched until cutover.

## Architecture
- Static frontend on Cloudflare Pages, deploying from this branch (later main).
- Supabase tables: `products`, `packages`, `site_settings`, `appointments`,
  `contact_messages`. Storage buckets: `product-images`, `site-assets`.
- Public site reads via anon key + RLS (SELECT public). Keep the current JSON
  defaults as fallback so pages render before Supabase is wired.
- Custom /admin/: Supabase Auth (email magic link for Joe/Angel), CRUD for
  products/packages/settings, image uploads to Storage, inbox view for
  appointments + contact messages.
- RLS: anon SELECT on content tables; anon INSERT on appointments/contact_messages
  (public forms); content writes restricted to authenticated staff.
- Remove: Sveltia CMS files, netlify/functions/auth.js + callback.js.

## Phases
1. Recon: map content/*.json models, script.js data usage, current /admin files,
   netlify functions, stylesheet versioning.
2. supabase/schema.sql: tables + RLS policies + storage buckets, with seed data
   migrated from the existing content/*.json.
3. Frontend data layer: js/db.js (supabase-js via CDN, config in js/config.js with
   PLACEHOLDER url/key), refactor renders to use it with JSON fallback.
4. /admin/ UI: login, products CRUD, packages CRUD, settings form
   (address/phones/hours/socials/verse/logo upload), inbox for appointments/messages.
5. Cleanup + docs: delete Sveltia + netlify functions, SETUP.md with the dashboard
   steps Jesus must click (Supabase project, Cloudflare Pages connection).

## Constraints
- Vanilla JS, no build step; `node --check` must pass on every JS file.
- Stylesheet `?v=` bump discipline stays: bump on all pages with every CSS change.
- Never commit keys. Config placeholders only — Jesus provides the real
  Supabase URL + anon key later.
- Verify every push by re-fetching the file from the branch.
- Parallel workers: strict file ownership (supabase/*, js/db.js+js/config.js,
  admin/*, docs) — no two workers touch the same file.


---

## Status: implementation complete (2026-09-21)

All build tracks are merged into `cloudflare-supabase`:

- `supabase/schema.sql` + `supabase/README.md` — 9 tables with RLS,
  storage buckets, and seed data.
- `js/config.js` — project URL + anon key wired (owner-approved, public by
  design).
- `js/db.js`, `script.js` (Supabase-first with JSON fallback), and the 4 HTML
  pages (`?v=20260921a`).
- `admin/` is the custom Supabase admin (`admin/config.yml` removed);
  login is magic-link via Supabase Auth.
- `netlify/functions/auth.js` and `netlify/functions/callback.js` (Sveltia
  GitHub OAuth) deleted — dead code.
- `SETUP.md` at repo root — owner-friendly, on-the-phone setup steps.

Remaining work is the owner's: run the SQL (SETUP.md step 1), connect the
Pages project to the repo (step 4), and flip the switch (step 6).
