# PROJECT_STATUS.md — Whispering Green Foundation MVP

Last updated: final completion & QA pass (24 Sept 2026). Prior passes intact — logo/hydration fix preserved (`nestedAnchorCount = 0`).

## Final completion & QA pass (24 Sept 2026)

End-to-end workflow re-tested through the real UI on a fresh request: submit → reference code → admin queue → review → approve → schedule → reschedule → in-progress → complete → link a collection record (draft) → verify → public impact. Tested with `WGF-RSU2-8FJ4` (now completed, 12.5 kg record verified).

**Bugs found and fixed**

1. **Resident/staff date disagreement (real, user-visible).** Dates are stored as local midnight, but several read paths used `toISOString().slice(0,10)`, shifting the day by one in IST. Staff picking 15 Dec showed the resident "14 Dec", and the admin reschedule/record-edit inputs pre-filled a day early (re-saving silently moved the collection). Added `toDateInput()` (local `YYYY-MM-DD`) + `formatDateOnly()` to `lib/format.ts` and replaced all 10 UTC-slice call sites (track API, request detail, status panel, collections, records manager, events, projects, dashboard chart). Verified: pick 15 Dec → resident sees "15 Dec 2026" → admin input pre-fills `2026-12-15`.
2. **Dead "View resident photo" link.** The admin request detail linked to `/api/media/file/<path>`, which did not exist (404). Added `app/api/media/file/[...path]/route.ts` — staff-only (401 unauthenticated), path-traversal guarded (400), image types only. Verified 200 image/png for a real upload.
3. **Founder-only pages were readable by staff.** `/admin/staff` listed every staff email to any staff account; `/admin/settings` showed the foundation settings form (saving was already founder-guarded server-side). Staff is now redirected from `/admin/staff`, and `/admin/settings` shows the founder notice instead of the settings form while keeping the change-password card (staff need it).
4. **Homepage impact summed mixed units.** `bags`/`other` quantities were added into the "kg" figure while the admin correctly filtered kg-only. Homepage now sums kg records only (55 kg / 2 verified records — matches the admin figure exactly).
5. **Admin dashboard overflowed horizontally at 375px.** Recharts card forced a min-content width inside the CSS grid; fixed with `min-w-0` on the grid children.
6. **Redundant always-erroring "Schedule" button** in the request action row (scheduling lives in its own sub-form) — removed; the schedule sub-form and reschedule path remain.
7. **Unvalidated `assignedEventId`** on scheduling — now rejected unless the event exists and is published.
8. **Malformed pagination links** in the admin request list (`href={{ query }} as never`) — replaced with a real query-string builder.
9. **"Go to collection records" deep link** passed an empty `requestId`; now passes the real id and pre-fills the record form's "Linked request" field.
10. **Demo credentials rendered on the public login page in every environment** — now shown only when `NODE_ENV !== "production"`.
11. **Dialog triggers were `<span onClick>`** (mouse-only) in 7 admin managers — converted to real `<button type="button">` (keyboard focusable, 0 `span[onclick]` remain).

**Added:** admin `loading.tsx` skeleton; `robots: noindex` metadata for the whole `/admin` tree.

**Verified this pass:** full workflow A–N (see table below), `npm run lint` 0 errors / 37 pre-existing warnings (no new), `tsc --noEmit` clean, `npm run build` succeeds (all routes incl. `/api/media/file/[...path]`; migrations up to date, 1 migration, DB schema in sync), no horizontal overflow at 375/768/883/1280px (home, request form, tracking, dashboard, both tables, detail page, modal), console clean on fresh loads (no hydration/nested-anchor/LCP warnings), 0 dead internal links across 10 public pages, 0 nested anchors.

**Negative/security tests:** unauth `/admin` → 307; unauth photo route → 401; unauth CSV export → 401; wrong tracking contact → 404; nonexistent reference → 404; malformed track payload → 400; invalid request submission → 400 with field errors; login rate limit → 429 after 10 attempts; phone contact matching normalises spaces/dashes.

**Severity note (documented limitation):** the in-memory rate limiter is per-process and shared across all clients behind localhost — restarting the dev server clears it. Documented in README; a Redis/upstash store is the production fix.

## Workflow + branding pass (23 Sept 2026)

- **Request workflow rebuilt around explicit staff actions.** Root cause of the "staff can't accept/schedule" report: the old UI was a single generic "choose next status" dropdown — every server transition worked, but the interface gave no review/approve/schedule/reject affordances. The detail page now has per-status action buttons (Start review, Approve, Schedule, Start collection, Mark completed, Reject…, Cancel…) with confirm dialogs for consequential states.
- **Server-side rules hardened** in `updateRequestStatus`: rejection/cancellation now *require* a resident-readable reason; scheduling requires a date and rejects past dates; rescheduling (`scheduled → scheduled`) is now an allowed self-transition so dates can be corrected. All enforcement is server-side, not just UI.
- **Resident tracking shows the scheduled collection date** (date-only, only while scheduled/in-progress) — previously the timeline said "Collection scheduled" without saying when.
- **Real WGF logo integrated** (supplied asset, stored at `public/brand/wgf-logo.{jpeg,png}` + `public/brand/wgf-icon.png`): header, footer (on a white chip for the dark surface), login, admin sidebar, 404/error pages, homepage volunteer CTA, and favicon (`app/icon.png` replaced the placeholder leaf SVG). Aspect ratio preserved everywhere; obsolete `LeafMark` placeholder fully removed.
- **SEO endpoints added**: `/robots.txt` (disallows `/admin`, `/api/`, `/track-request`) and `/sitemap.xml`; tracking page gets `noindex` metadata.
- **LCP fix**: header logo gets `priority` (was flagged as the homepage LCP element).
- Verified: full lifecycle exercised through the real admin UI (schedule → reschedule → start → complete with confirm), rejection rules enforced, unauthenticated action calls rejected, tracking privacy intact (`404` on wrong contact, no private fields in payload), `npm run lint` 0 errors, `tsc --noEmit` clean, `npm run build` succeeds (migrations applied to hosted Neon DB), no horizontal overflow at 375px, browser console clean.

## Security upgrade pass (20 Sept 2026)

- **Next.js upgraded 15.5.4 → 15.5.25** (latest patched 15.x; `eslint-config-next` kept in lockstep) — clears the two critical Next.js RCE advisories (`GHSA-9qr9-w5v8-mr35`, `GHSA-4q86-7x8j-9v4w`) that were blocking Vercel deployment. React 19.1.0 unchanged.
- **sharp 0.34.x → 0.35.4** via `npm audit fix` — clears inherited libvips/libheif CVEs.
- Remaining `npm audit` entries reviewed and documented as not-applicable-to-this-app: the `postcss` advisory is in Next's own bundled copy (fix is a breaking Next 16 upgrade); the `deepmerge-ts` advisory is in the Prisma CLI's config merger (fix is a Prisma downgrade below 6.13 — rejected to stay current).
- Verified after upgrade: `npm run lint` (0 errors), `tsc --noEmit` clean, `next build` succeeds — all routes compile, middleware builds, all data routes remain dynamic (no build-time DB access).

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
| Prisma 6 + PostgreSQL (Neon), migration + indexes + unique constraints | 🧪 | pooled `DATABASE_URL` + direct `DIRECT_URL`; `npm run build` runs `prisma migrate deploy` |
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
| 19 | Homepage impact = verified kg-only sum (55 kg / 2 records after the 24 Sept pass) | ✅ |
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
