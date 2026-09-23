# Oasis site — setup steps (branch: cloudflare-supabase)

Follow these steps in order on your phone. Each one is just taps — no code.
When everything below is green, the new site is ready.

---

## 1. Set up the Supabase database

1. Open your Supabase project: `edilqqdhmkopikdfzhvz`
   (go to supabase.com → your project).
2. Tap the left menu and open **SQL Editor**.
3. Tap **New query**.
4. Open the file `supabase/schema.sql` in this branch of the GitHub repo
   (petrax5/Joselaw, branch `cloudflare-supabase`) and copy its **entire
   contents**.
5. Paste it into the SQL Editor and tap **Run**.

**What success looks like:** a green "Success" banner at the bottom of the
screen, with a results panel showing the rows that were created
(products, brands, services, packages, testimonials, social links, site
settings — 9 tables in total).

Notes:
- The **Storage bucket** (`product-images`) is created BY this same SQL.
  There is no separate step for it.
- It is **safe to run the script more than once** — running it again does not
  break anything or duplicate data.

## 2. Logins (no setup needed)

- Joe and Angel log in at **`/admin/`** with their email address.
- Supabase sends them a **magic link** by email — they tap it and they're in.
- Supabase's built-in email sender handles this, and it is free for 2 users.
  **Nothing to configure here.**

## 3. Site config — already done

The Supabase connection (project URL + the public anonymous key) is already
wired into `js/config.js` on this branch. **No action needed.**

## 4. Publish the site on Cloudflare Pages

1. Go to **dash.cloudflare.com**.
2. Tap **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select the repo **petrax5/Joselaw**.
4. Set the **production branch** to `cloudflare-supabase` (for now).
5. Framework preset: **None**.
6. **Build command:** leave empty.
7. **Build output directory:** `/`.
8. Tap **Save and Deploy**.

Cloudflare will build the site and give you a `*.pages.dev` URL.

## 5. Custom domain (when you're ready)

1. Open your Pages project → **Custom domains**.
2. Tap **Set up a custom domain** and enter your domain.
3. Follow the DNS prompts on screen.

## 6. Cutover checklist

Before switching over, verify all of this on the Pages URL:

- [ ] Products load and look right
- [ ] Service packages and prices look right
- [ ] Footer (hours, address, phones) looks right
- [ ] Log in at `/admin/` via magic link
- [ ] Submit a **test appointment** and a **test contact message** — then check
      they show up in the admin **Inbox**

When you're happy:
1. Merge this branch into `main`, or switch the Pages production branch to
   `main`.
2. Connect your custom domain (step 5) if you haven't yet.
3. Retire the old Netlify site.

## 7. Rollback / safety note

The live Netlify site running on `main` is **untouched** by everything on
this branch. Nothing breaks and nothing changes for your customers until
**you** flip the switch in step 6.

---

*Status: implementation complete — database schema, Supabase-powered site
code, custom admin, and these setup steps are all in place on this branch.*
