# Run doc — Whispering Green Foundation (localhost MVP)

Next.js 15 (App Router, TypeScript, Turbopack) + Prisma 6 + SQLite. Node 18.18+ required.

## Reproduce uncommitted artifacts

A fresh checkout needs these before the server will start:

1. **Environment file** — copy `.env` from the main checkout root to the same location
   (or create it from `.env.example`). It defines:

   ```
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET="..."
   UPLOAD_DIR="uploads"
   ```

   `SESSION_SECRET` is a local demo value; any long random string works.

2. **Install dependencies** — npm is the package manager (npm lockfile present):

   ```
   npm install
   ```

3. **Prisma client** — generated as part of `npm install` (postinstall) or manually:

   ```
   npx prisma generate
   ```

4. **Database + seed data** — the SQLite file `prisma/dev.db` is git-ignored. Recreate with:

   ```
   npm run db:setup   # prisma migrate deploy + prisma generate
   npm run db:seed    # idempotent demo seed (accounts, articles, events, records)
   ```

5. **Uploads folder** — created automatically on first upload; no action needed.

## Run the server

```
npm run dev
```

- Default port: **3000** (`next dev --turbopack`).
- If 3000 is busy, Next.js 15 auto-picks a random free port — check the terminal/log for
  "Local: http://localhost:PORT" and use that, or force one with `PORT=3100 npm run dev`.

## Verify

- `GET /` → 200 (home page renders with hero + impact card).
- `GET /icon.svg` → 200.
- Demo logins (seeded): `founder@wgf.demo / Founder@123`, `staff@wgf.demo / Staff@123` at `/login`.

## Troubleshooting

- "Database not reachable" on the homepage → run the db steps above, restart the server.
- Login rejected → re-run `npm run db:seed`.
- Port conflict → set `PORT` env var to any free port; no config change required.
