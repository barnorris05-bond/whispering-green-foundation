# PROJECT_STATUS.md — Whispering Green Foundation MVP

Last updated: post-review content & polish pass (19 Sept 2026). Prior full QA pass intact — all 20 checks below re-verified after changes.

## Post-review pass (19 Sept 2026)

Improvements driven by the website review checklist:

- **Gallery populated** — 6 labelled local SVG artwork entries (creek clean-up, sorting, sapling drive, plastic baling, collection van, awareness session) served from `public/artwork/` via the media API; no remote images. Admin gallery manager works on them like any media item.
- **Homepage** — fake "Coming soon" stats replaced with a what-would-you-like-to-do quick-actions row (request / track / volunteer / learn); intro now states the CEP Phase II (Eco Engineering) provenance with a link to the methodology story; hero visual caption kept honest.
- **About page** — finished public content: mission/vision/values retained, added "From logbook to published number" method section and a CEP Phase II context block that discloses the unreconciled 720 kg logbook total; the "A note on this website" demo notice replaced by real content + final CTA.
- **Awareness portal** — new verified-style article "The logbook behind our numbers" explaining the verification pipeline; search/filters were already server-side functional; empty state in place.
- **Contact form** — server-side field-level errors now surfaced inline per field (they were only toast-level before).
- **Core loop re-verified through the real UI** — submit → staff schedule with note → resident tracking shows progress + note (no name/address leak) → staff adds verified collection record linked to the request → homepage impact updates (50 → 58.5 kg). Leftover 999 kg QA record removed.

## Legend
✅ implemented · 🧪 implemented & QA-verified · 🟡 deferred / partial

## Legend
✅ implemented · 🧪 implemented & QA-verified · 🟡 deferred / partial

## Platform

| Area | Status | Notes |
| --- | --- | --- |
| Next.js 15 (App Router, TS, Turbopack) + Tailwind v4 | 🧪 | `npm run build` clean, `tsc --noEmit` clean |
| Prisma 6 + SQLite, migration + indexes + unique constraints | 🧪 | `prisma/migrations/20260918130902_init` |
| Auth: scrypt hashes, DB sessions, httpOnly cookies, roles | 🧪 | founder/staff; rate-limited login |
| Middleware gate + server-side action guards + audit log | 🧪 | unauth `/admin` → 307; unauth actions → error |
| Public site (12 routes) + admin (11 routes) | 🧪 | all return 200 authenticated; 404 page; error boundary |
| Design system: eco palette, glass accents, motion primitives | 🧪 | reduced-motion respected via CSS |
| Responsive mobile nav, drawers, tables | 🧪 | manual review; horizontal-scroll tables |
| Seed script (demo + logbook data, labelled) | 🧪 | idempotent, re-runnable |
| Upload handling with MIME/size validation + private gating | 🧪 | text-file upload rejected; PNG accepted; private media 401 |
| README, .env.example, PROJECT_STATUS | ✅ | |

## Core workflow (tested end-to-end via API + real server actions)

| # | Test | Result |
| --- | --- | --- |
| 1 | App starts locally, all public routes 200 | ✅ |
| 2 | Login founder + staff; wrong password 401; logout works | ✅ |
| 3 | Unauthenticated cannot access `/admin` or admin APIs | ✅ (307/401) |
| 4 | Resident submits valid request → 201 + reference code | ✅ |
| 5 | Invalid submission (missing contact) → 400 + field errors | ✅ |
| 6 | Duplicate/edge inputs rejected (bad email 400) | ✅ |
| 7 | Requests persist across requests (SQLite) | ✅ |
| 8 | Reference codes unique, non-sequential (`WGF-XXXX-XXXX`) | ✅ |
| 9 | Tracking with wrong contact → 404; correct → status + updates, no private fields | ✅ |
| 10 | Staff status transitions create history entries with actor + note | ✅ (5 entries) |
| 11 | Invalid transition (completed → submitted) rejected server-side | ✅ |
| 12 | Staff creates verified + draft collection records | ✅ |
| 13 | Public impact counts verified only (draft 999 kg excluded) | ✅ |
| 14 | Event status lifecycle works (draft→published→completed) | ✅ |
| 15 | Volunteer registration + duplicate prevention (409) | ✅ |
| 16 | Contact message persists and appears in staff inbox | ✅ |
| 17 | Invalid upload rejected; valid PNG stored | ✅ |
| 18 | CSV export requires auth | ✅ |
| 19 | Homepage impact = verified sum (42.5 seed + 7.5 QA + 8.5 workflow = 58.5 kg) | ✅ |
| 20 | `tsc --noEmit` and `next build` clean | ✅ |

## Deferred (documented, non-blocking)

- 🟡 Email/SMS notifications — toasts + on-screen confirmation instead.
- 🟡 Rate limiting shared across processes / persistent store.
- 🟡 Image re-sizing/optimisation on upload.
- 🟡 Resident accounts (self-service login to see own requests) — secure tracking covers the demo need.
- 🟡 CSV export of requests (registrations export is done).
- 🟡 Recharts chart animates via CSS default; custom animation timing not tuned.
- 🟡 Localisation (English only).

## Manual visual QA suggested before demo

- Walk through mobile nav + forms at 375px width.
- Verify reduced-motion rendering if OS setting available.
- Skim all pages for copy: replace “placeholder” contact info via Admin → Settings before showing.
