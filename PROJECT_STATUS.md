# PROJECT_STATUS.md — Whispering Green Foundation MVP

Last updated: Final QA + founder-ready pass (8 Oct 2026) — responsive nav bug fixed, full route matrix verified, build clean. Prior passes intact.

## Final QA + Founder-Ready Pass (8 Oct 2026)

Scope: final verification of all public routes, Events removal, navigation responsive fix, security, donation page, API validation, SEO, and build quality. No features added, no schema changed, no data modified.

### Fix applied

**1280px navigation hamburger bug (Tailwind v4 cascade issue).** The hamburger button used `lg:hidden btn btn-ghost btn-sm` and the mobile nav panel used `lg:hidden`. In Tailwind v4, unlayered CSS (the `.btn` class in `globals.css`) has higher cascade priority than utility classes, so `.btn { display: inline-flex }` overrode `lg:hidden { display: none }` — making the hamburger visible at desktop widths simultaneously with the desktop nav. Fixed by using `lg:!hidden` (Tailwind v4 important modifier) on both the hamburger button and the mobile nav panel, and `!hidden sm:!inline-flex` on the "Request collection" header link for the same reason.

### Verified this pass

- `/events` → 404; `/events/test` → 404 (real 404, not soft 200). ✅
- Zero `/events`, "Upcoming Events", "Register for Event" or "event registration" references in any public page, header, footer, or sitemap. ✅
- All 13 public routes return 200; `/projects` → 307 (redirect to `/initiatives`). ✅
- `/projects/nonexistent-test-slug` → 404; `/awareness/nonexistent-test-slug` → 404 (real 404s). ✅
- Sitemap contains `/journey`, `/donate`; contains no `/events` or `/admin` URLs. ✅
- robots.txt disallows `/admin`, `/api/`, `/track-request`, `/login`. ✅
- `/admin` unauthenticated → 307. `/api/media/file/[path]` unauthenticated → 401. ✅
- `/api/requests` malformed → 400. `/api/requests/track` wrong contact → 404. ✅
- `/api/contact` malformed → 400. `/api/admin/export/registrations` unauthenticated → 401. ✅
- Donate page: heading "Donate by Bank Transfer", all bank fields correct, no Razorpay/Stripe/PayPal/UPI. ✅
- Clipboard values confirmed: `501000000468191`, `BACB0000003`, `400238003` (no spaces). ✅
- `npm run lint` → 0 errors, 0 warnings. ✅
- `npx tsc --noEmit` → clean. ✅
- `npm run build` → succeeds, 37 routes compiled, no `/events` public route in output. ✅
- No new commits made; all changes remain in working tree. ✅

### Test data / impact note (for founder review)

The current displayed impact (visible on homepage and `/journey`) is sourced from verified collection records in the database. This includes a **42.5 kg "DEMO SAMPLE" verified record** seeded for pipeline testing, plus any records verified during QA passes. Founders should review **Admin → Collections** and decide whether to delete QA/demo records before presenting real impact figures. The unverified logbook records (500/350/220 kg from CEP Phase II) remain draft and do not contribute to public numbers until explicitly verified by staff.



## Public Events removal (7 Oct 2026)

The foundation decided the public Events/upcoming-events feature is no longer part of the website. What changed and what deliberately did not:

- **Removed (public only):** the `/events` and `/events/[slug]` pages (with their loading state), the public volunteer-registration API (`/api/events/register`), the header/desktop+mobile Events buttons, both footer Events links, the homepage "Upcoming events" section and its impact stat (replaced by an honest **Published initiatives** count), the "Volunteer at a drive" quick link (now "Support our work" → `/donate`), the get-involved band's event-registration promise (now: request a collection / support our work / get in touch), all Events CTAs and wording on About, Contact, Gallery, Login and the Journey pillars, the root layout metadata wording, the two `revalidatePath("/events")` calls in the admin event actions, and the `/events` entries in `sitemap.xml`. `robots.txt` never referenced `/events`, so it needed no change.
- **Kept on purpose (internal scheduling):** the `Event` model and its relations (`CollectionRequest.assignedEventId`, `CollectionRecord.eventId`, `Media.eventId`, `VolunteerRegistration`), the **Admin → Events manager**, the volunteers/attendance pages and the registrations CSV export. Collection scheduling and record linking are staff workflows that still rely on events; the homepage nav/footer simply no longer expose any of it publicly.
- Verified: zero `/events` references remain anywhere in `app/`, `components/` or `lib/` outside the admin area; `/events` now returns a real 404; lint, `tsc --noEmit` and the production build pass.

## Final product polish, content & performance pass (25 Sept 2026)

Scope: codebase audit, a new **Foundation Journey** page, homepage/hero and page-by-page polish, one consistent CSS animation system, per-route loading states, SEO/accessibility/responsive work, and a major performance pass. No workflow was changed, no database schema was changed, and no existing QA data was destroyed.

### Added

1. **`/journey` — Foundation Journey.** A chronological storytelling page: hero, "Where it began" + a *From the Founder* card, an alternating (desktop) / single-column (mobile) timeline with a connecting rail, six activity strands, a "where we are today" section that deliberately separates *foundation activities* / *verified impact data* / *website functionality*, and "The Next Chapter" with existing-route CTAs. It is linked from the primary nav ("Our Journey"), the footer, the About page and a homepage band.
2. **Truthful content structure.** All narrative copy lives in `lib/journey.ts` (`JOURNEY_ERAS`, `JOURNEY_PILLARS`, `JOURNEY_TODAY`, `JOURNEY_NEXT`). Anything we cannot verify is written in `[square brackets]` with `source: "placeholder"`, which renders a visible **“Awaiting foundation input”** badge; the two unverifiable eras carry it today.
3. **Founder note via the existing admin content system.** A new content category, `founder_note` ("Founder's story (Foundation Journey)"), is authored in **Admin → Awareness content** and appears automatically in the *From the Founder* card. It is filtered out of the awareness portal, `/awareness/<slug>`, the homepage article list and `sitemap.xml` (`AWARENESS_CATEGORIES` / `JOURNEY_CONTENT_CATEGORY` in `lib/domain.ts`). Verified: published note → visible on `/journey`, absent everywhere else, `/awareness/<slug>` → 404, not in the sitemap. The founder's story is never invented — the empty state says so explicitly.
4. **Consistent animation system (CSS-first).** `Reveal` was rewritten as a progressive-enhancement IntersectionObserver component: content is **visible by default in the server HTML** (no JavaScript required), only below-the-fold elements are hidden after mount, and `prefers-reduced-motion` skips it entirely. Framer Motion was removed from `components/ui.tsx`, `public-header.tsx`, `page-transition.tsx`, `request-form.tsx`, `track-client.tsx` and `gallery-grid.tsx` — it is now used **only** in the admin shell. Reduced-motion handling was extended (hover transforms disabled, delays zeroed, reveal states forced visible).
5. **Per-route loading skeletons.** `journey`, `initiatives`, `gallery`, `awareness` (list routes) plus `admin`, `admin/requests`, `admin/collections`, `admin/content`, `admin/gallery`, `admin/volunteers`, sharing `components/skeletons.tsx`.
6. **SEO.** `metadataBase` + site-level Open Graph/Twitter defaults, a generated `opengraph-image` (text/shapes only, no invented logo), per-page canonical + OG metadata, dynamic `sitemap.xml` entries for published projects/articles (with a DB-outage fallback), `/login` added to `robots.txt` disallow and removed from the sitemap, and admin pages given their own title template.
7. **Accessibility.** A "Skip to content" link, `Breadcrumbs` now uses `next/link` (client navigation, was a full page reload), `ConfirmDialog` gained Escape handling, a light-on-dark focus ring for the footer/dark panels, `[id]` scroll-margin so hash links clear the sticky header, and the toast close button is now a proper padded hit target.
8. **Media.** New `components/media-image.tsx`: raster uploads go through `next/image` (responsive `sizes`, WebP, lazy) while the local SVG artwork stays a plain `<img>` (the optimizer refuses SVG by design). The gallery moved from a masonry column layout to a uniform 4:3 responsive grid — matching the shipped artwork exactly and removing all layout shift.
9. **Shared skeleton/util de-duplication:** `PROJECT_CATEGORIES` / `PROJECT_CATEGORY_LABELS` / `PROJECT_STATUS_LABELS`, `AWARENESS_CATEGORIES`, `lib/site.ts`, `lib/schemas.ts`, `components/skeletons.tsx`, `components/media-image.tsx`.

### Bugs found and fixed

1. **Staff-only note leaked to residents (privacy).** `addInternalNote` wrote the note into `RequestStatusHistory`, and the tracking API publishes *every* history entry carrying a note — so a note labelled "Visible to staff only…" appeared in the resident's timeline. Internal notes are now stored in the staff-only `AuditLog` (`request.internal_note`) and rendered in a new *Internal notes* card on the admin request detail page. Verified: the note is saved, visible to staff, and absent from the tracking payload. (Filtering by `oldStatus === newStatus` would have been wrong — legitimate reschedule notes share that shape.)
2. **Route-level `loading.tsx` broke 404s.** Adding `loading.tsx` to a route makes Next stream the shell, after which `notFound()` can only produce a **soft 404 (HTTP 200)**. `/awareness/<missing>`, `/events/<missing>` and `/projects/<missing>` all returned 200. Fixed by removing those boundaries and scoping the list-page skeletons inside `(index)` route groups; all three now return real 404s again while `/awareness` and `/events` keep their loading states.
3. **Project categories were labelled with the waste-category map.** `CATEGORY_LABELS` (plastic/dry recyclable/…) was used for project categories, so `/projects/<slug>` and the homepage rendered the raw column value (`waste`). Two divergent copies existed (a local `CATEGORY_UI` map in `initiatives/page.tsx`). Replaced with one shared `PROJECT_CATEGORY_LABELS` used by the listing, the detail page, the homepage and the admin managers.
4. **Homepage title duplicated the site name** (`… — Community waste action in Vasai-West · Whispering Green Foundation`). The root title template now applies everywhere except the homepage, which opts out with `title: { absolute }`.
5. **~97 kB of zod shipped to the browser.** `lib/domain.ts` mixed plain constants (imported by client components) with zod schemas, so the request form, tracking page and several admin pages bundled the whole validation library. Schemas moved to `lib/schemas.ts` (server-only importers).
6. **Dead code removed:** the unused `CountUp` component and `publicRequestView` helper, an unused `noteState` prop, and every unused import — `npm run lint` went from **37 warnings to 0**.
7. Small polish fixes: mobile timeline dot centred on the rail (was 2px off), `aria-current` retained on nav links, gallery lightbox prev/next now disabled at the ends, the request form's success screen leads with the reference code and an explicit "Save this reference number to track your request", and the events/awareness/homepage cards gained the same hover affordance.

### Performance results (production build, First Load JS)

| Route | Before | After |
| --- | --- | --- |
| `/request-collection` | 245 kB | **148 kB** |
| `/track-request` | 244 kB | **147 kB** |
| `/admin/collections` | 289 kB | **192 kB** |
| `/admin/content` | 289 kB | **192 kB** |
| `/admin/projects` | 289 kB | **192 kB** |
| `/admin/requests/[id]` | 290 kB | **193 kB** |
| Public content pages (`/`, `/about`, `/journey`, `/awareness`, `/donate`, `/initiatives`) | 143 kB | 143 kB (shared) |

Cause of the reductions: the zod split above, `next/dynamic` for the recharts dashboard chart (its own chunk, loaded after the page is interactive), and framer-motion no longer being part of the public shell. Other work: `select`-scoped Prisma queries (homepage projects/articles, initiatives list), `Promise.all` in the admin request detail (events + internal notes), and `priority` reserved for the header logo only.

### Verified this pass

- `/journey` at 1280/1024/768/375/1440: no horizontal overflow, rail perfectly centred (712 = layout centre at 1440), cards alternate, all 24 reveals resolve to visible after scrolling, **0 `data-reveal` attributes in the server HTML** (so the page reads fully without JavaScript).
- Responsive sweep 375/390/768/883/1024/1280/1440: no page-level horizontal overflow on `/`, `/journey`, `/gallery`, `/request-collection`, `/admin`, `/admin/requests`; admin tables scroll internally (325px client vs 613px content at 375px); request form touch targets ≥ 44px; admin dashboard chart card 326px wide at 375px.
- Functional regression on a fresh request `WGF-AM4J-FC3A`: submit through the real form → reference code + confirmation → track (public payload has no name/email/address; wrong contact → 404) → staff *Start review* → *Approve* → *Schedule* (2026-11-20, stored as 2026-11-19T18:30Z = correct local date) → internal note → *Start collection* → *Mark completed*.
- Impact integrity: homepage **55 kg / 2 verified** exactly matches the database. Adding a **draft** 9.5 kg record left it at 55 kg; verifying it moved homepage and journey to 64.5 kg / 3; deleting it restored 55 kg / 2. `/journey` shows the same live figure.
- Security: unauth `/admin` → 307, unauth resident-photo route → 401, unauth CSV export → 401, malformed track body → 400, invalid request submission → 400, `.env` and `uploads/` untracked.
- 22 unique internal links across 10 public pages, **0 broken**. All 14 public routes + 3 detail routes + `robots.txt`/`sitemap.xml`/`icon.png`/`opengraph-image` return 200.
- `npm run lint` → **0 errors, 0 warnings**; `npx tsc --noEmit` → clean; `npm run build` → succeeds, migrations up to date, 20 static pages generated.

### Disclosed test data (this pass)

One new collection request `WGF-AM4J-FC3A` (Chulne, dry recyclable, 6 kg) now exists as **completed** with history and one staff-only internal note; it is not counted in public impact (no collection record). The temporary founder-note article, the temporary draft 9.5 kg record and the temporary media/PNG fixture used to verify `next/image` were all deleted afterwards. Media rows remain at 6 and content rows at 6.

### Notes / deliberate limitations

- Local builds print `metadataBase … is not set` — intentional: with no `NEXT_PUBLIC_SITE_URL` and no Vercel origin, no absolute canonical/OG URL is emitted rather than a wrong one. On Vercel the platform origin is used automatically; set `NEXT_PUBLIC_SITE_URL` once a custom domain exists.
- The full status history is still exposed to the resident (correct — it is the resident's own request), but it now contains only resident-readable notes.
- Public DB-backed pages remain `force-dynamic`. ISR/revalidation was deliberately **not** introduced: the verified-impact rule and the request/tracking flows are correctness-critical, and caching them could show stale figures. This is the largest remaining server-side performance opportunity.
- Detail routes intentionally have no `loading.tsx` (see bug 2) — the list routes carry the skeletons.

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
| Public site (14 routes incl. `/journey`) + admin (11 routes) | 🧪 | all return 200 authenticated; real 404s on missing slugs; 404 page; error boundary |
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
| 21 | `/journey` renders timeline + placeholders, no JS required (0 `data-reveal` in server HTML) | ✅ (25 Sept pass) |
| 22 | Founder note published via Admin → Content appears on `/journey` only (not awareness, homepage, sitemap) | ✅ (25 Sept pass) |
| 23 | Staff-only internal notes never appear in the resident tracking payload | ✅ (25 Sept pass) |
| 24 | `loading.tsx` boundaries do not soften 404s (`/awareness`, `/events`, `/projects` missing slugs → 404) | ✅ (25 Sept pass) |

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
