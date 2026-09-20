# 🌿 Whispering Green Foundation — localhost MVP

A full-stack demonstration platform for a community waste collection & awareness initiative in
**Vasai-West, Maharashtra**. Public foundation website + resident collection-request portal +
secure request tracking + protected staff dashboard with verified-impact reporting.

> **This is a local demo build.** No real foundation data, registration details, or contact
> information is included. Anything not sourced from the project brief is an editable
> placeholder or clearly-labelled sample data.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create .env with your Postgres connection strings (see "Environment variables" below)
cp .env.example .env

# 3. Create the schema (migrations) + Prisma client against your Postgres
npm run db:setup

# 4. Seed demo data (demo accounts, sample content, UNVERIFIED logbook records)
npm run db:seed

# 5. Run the dev server
npm run dev
```

Open **http://localhost:3000** (the port is shown in the terminal if 3000 is busy —
e.g. `http://localhost:3100` or a random free port; use whatever the terminal prints).

### Demo credentials

| Role    | Email               | Password      |
| ------- | ------------------- | ------------- |
| Founder | `founder@wgf.demo`  | `Founder@123` |
| Staff   | `staff@wgf.demo`    | `Staff@123`   |

Login page: `/login` → redirects to `/admin`. Both seeded accounts carry a
**“must change password”** flag with a visible banner; change them under
**Admin → Settings → Change my password** before any serious use.

## Prerequisites

- Node.js 18.18+ (built & tested on Node 24)
- A PostgreSQL database — the easiest is a free **Neon** database (neon.tech). The same
  database serves local development and the Vercel deployment (see *Deploy to Vercel*).

## Scripts

| Command             | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Start dev server (Turbopack)                                        |
| `npm run build`     | Prisma generate + migrate deploy + production build (same as Vercel) |
| `npm start`         | Serve the production build                                          |
| `npm run db:setup`  | Apply migrations + generate Prisma client                           |
| `npm run db:seed`   | Seed demo data (idempotent)                                         |
| `npm run db:reset`  | **Drops all data** — re-apply migrations + reseed                     |
| `npm run lint`      | ESLint                                                              |

## Environment variables

Copy `.env.example` → `.env`:

```
DATABASE_URL="postgresql://…-pooler…neon.tech/neondb?sslmode=require"   # pooled — runtime
DIRECT_URL="postgresql://…neon.tech/neondb?sslmode=require"             # direct — migrations
UPLOAD_DIR="uploads"                                                   # local uploads folder
```

`DATABASE_URL` is the **pooled** connection string (use it for the app), `DIRECT_URL` is
the **direct, non-pooled** string (use it for migrations — Neon/Supabase poolers do not
handle DDL safely). No API keys are required.

---

## The core demonstration workflow

```
Resident submits request  →  gets reference code (WGF-XXXX-XXXX)
        ↓
Staff reviews in /admin/requests  →  moves status (submitted → under review →
approved → scheduled → in progress → completed) with notes & history
        ↓
Staff adds a COLLECTION RECORD (date, locality, category, quantity, unit,
measured/estimated) and marks it VERIFIED
        ↓
Public impact on the homepage counts VERIFIED records only
```

**Logbook note (important):** the CEP Phase II logbook figures quoted in the brief
(500 kg on 22 Aug 2026, 350 kg on 29 Aug 2026, 220 kg on 13 Sep 2026, and a stated
**720 kg** “Weeks 5 & 7” total that does **not** match the 1,070 kg sum of those entries)
are seeded as **draft / unverified / “logbook”** records. They are **excluded from all
public numbers** until staff verify them in **Admin → Collections**. The discrepancy is
deliberately not reconciled in code — confirm against the source logbook first.

A fictional **42.5 kg “DEMO SAMPLE” verified record** is also seeded so the impact
pipeline is visible immediately; delete it in Admin → Collections if you want a clean slate.

## Route map

**Public** — `/` · `/about` · `/initiatives` · `/projects/[slug]` · `/events` ·
`/events/[slug]` · `/awareness` · `/awareness/[slug]` · `/gallery` · `/contact` ·
`/request-collection` · `/track-request` · `/login`

**Staff (auth required)** — `/admin` (dashboard) · `/admin/requests` (+detail) ·
`/admin/collections` · `/admin/events` · `/admin/volunteers` · `/admin/projects` ·
`/admin/content` · `/admin/gallery` · `/admin/messages` · `/admin/staff` *(founder only)* ·
`/admin/settings` *(founder only; password change for everyone)*

## Data privacy model

- Request **address, email, phone** are staff-only; they never appear in public pages or APIs.
- Tracking requires reference code **plus** matching contact — a guessed code reveals nothing.
- Resident photos and private media: only `approved` gallery media is served publicly
  (`/api/media/[id]` checks visibility).
- Passwords: scrypt hashes; sessions: random 32-byte tokens, SHA-256-hashed in DB,
  httpOnly cookies, 7-day expiry.
- Server-side validation everywhere (Zod), status transitions enforced server-side,
  admin APIs/actions guarded server-side (not just hidden UI), audit log for sensitive ops.
- In-memory rate limiting on public forms (documented limitation below).

## Deploy to Vercel (hosted via GitHub)

The deployment model is: **GitHub repo → Vercel builds it → hosted Postgres (Neon)**.

1. **Push the code to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for Vercel: PostgreSQL migration + serverless build config"
   git push origin main
   ```

2. **Create a free hosted Postgres** — [neon.tech](https://neon.tech), or in Vercel via
   *Storage → Create database → Neon*, or Supabase. Copy **two** connection strings from
   the dashboard: the **pooled** one (runtime) and the **direct/non-pooled** one (migrations).

3. **Set up the database once from your machine** (this prepares the exact DB the site uses):

   ```bash
   # paste both URLs into .env first
   npm run db:setup    # prisma migrate deploy + generate
   npm run db:seed     # demo content + demo accounts
   npm run dev         # local dev now uses the same hosted DB
   ```

4. **Import the repo into Vercel**: vercel.com → *Add New… → Project* → import
   `whispering-green-foundation`. The Next.js preset is detected automatically.

5. **Add environment variables** (Project → Settings → Environment Variables):
   `DATABASE_URL` (pooled string) and `DIRECT_URL` (direct string).

6. **Deploy.** The build runs `prisma generate && prisma migrate deploy && next build`.

7. **Verify the deployment**: open the site, submit a collection request, track it, log
   in at `/login` — then **change both demo passwords immediately** (Admin → Settings).

Deployed-demo differences: photo uploads are rejected with a clear message (Vercel's
serverless filesystem is read-only — submit without a photo; the seeded artwork gallery
still renders); rate limiting is per serverless instance; admin/staff logins use the
same seeded accounts.

## Known limitations (localhost MVP)

- **Rate limiting** is in-memory per process — resets on restart, not shared across workers.
- **Uploads** live in `/uploads` and are served through a DB-checked route; there is no
  virus scanning and no CDN. Images are validated by MIME/extension/size only.
- **Photo uploads are disabled on Vercel** (serverless filesystem is read-only); they work
  normally when running locally.
- **No email/SMS** — notifications are toasts and on-screen confirmation codes.
- **Search** uses `contains` (case-sensitive for non-ASCII; adequate for demo data).
- **Gallery demo imagery** is a set of six labelled illustration concepts (`public/artwork/*.svg`)
  seeded into the media table as `artwork:<key>` entries — clearly marked as concepts, not photographs.
  Replace them with real, consented event photos via Admin → Gallery for any real presentation.
- Draft/unverified content is hidden publicly but **staff must still exercise judgement**
  before verifying records — verification is a human step, not automated.

## Backup

- **Database**: a Postgres dump, e.g. `pg_dump "$DIRECT_URL" > backup.sql` (Neon/Supabase
  dashboards also offer backups/point-in-time restore on paid tiers).
- **Uploads**: copy the `uploads/` folder (relevant for local runs only).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Homepage says “Database not reachable” | Run `npm run db:setup && npm run db:seed`, restart dev server |
| `migrate deploy` fails with connection timeout | Migrations must use the direct URL — check `DIRECT_URL` is the non-pooled connection string |
| Vercel build fails on Prisma | Confirm `DATABASE_URL` + `DIRECT_URL` are set in Vercel → Settings → Environment Variables |
| Login says incorrect credentials | Re-run `npm run db:seed` (accounts are seeded) |
| Port already in use | `PORT=3100 npm run dev` (or any free port) |
| Uploaded image 404s | File must exist under `uploads/`; check `UPLOAD_DIR` matches |
| “Too many submissions” during testing | Wait 10–15 min or restart the dev server (rate limits reset) |
| Stale numbers after admin changes | Refresh — pages are dynamic; dev server caches nothing across requests |
