# Performance Audit — myfr.ai

**Date:** 2026-06-12  
**Scope:** Playbook §3.6 (bundle, API latency, Supabase queries, loading states, RivlyApp/DispatchView/HomeView renders)  
**Skills used:** `auditing-performance`, `profiling-performance`, `tailing-build-output`  
**Branch:** working tree (uncommitted)  
**Build command:** `npm run build` (Next.js 15.5.19)

---

## Executive summary

The app is a lean dependency stack (React 19, Supabase, Lucide, Tailwind v4) but the **customer home route ships ~655 KB of uncompressed JS** in a single client tree, and **edge middleware bundles ~316 KB of Supabase** for session refresh on every matched request. Dispatch quote updates use **full REST refetches** on every Realtime event instead of incremental patches. **`npm run build` currently fails** at the finalization step (ENOENT on static error pages / webpack cache), so production bundle metrics and Core Web Vitals on a prod build could not be fully validated.

**Top 3 actionable fixes (by impact):**

| # | Severity | Finding | Effort |
|---|----------|---------|--------|
| 1 | **P1** | Split/lazy-load dispatch stack; trim home first-load JS (~655 KB) | M (4–8 h) |
| 2 | **P1** | Replace Realtime→full `/api/jobs` refetch with targeted quote updates | S (2–4 h) |
| 3 | **P2** | Stabilize RivlyApp renders (memoize views, batch demo quote updates, pause placeholder timer on dispatch) | S (2–3 h) |

---

## Build output

### Status

| Item | Result |
|------|--------|
| Compile | ✓ Success (~7–11 s) |
| Typecheck / lint | ✓ Pass |
| Static generation | ✓ 19/19 pages |
| **Finalization** | **✗ FAIL** — intermittent `ENOENT` (see below) |

### Failure details (3 attempts)

```
# Attempt 1 (clean .next)
[Error: ENOENT] open '.next/server/edge-runtime-webpack.js'

# Attempt 2 (clean .next)
[Error: ENOENT] open '.next/server/pages-manifest.json'

# Attempt 3 (all permissions, telemetry off)
[Error: ENOENT] rename '.next/export/500.html' -> '.next/server/pages/500.html'
```

Webpack cache also logged:

```
Caching failed for pack: ENOENT rename '.../client-production/0.pack_' -> '0.pack'
```

**Action:** Treat as **P0 release blocker**. Try `rm -rf .next node_modules/.cache && npm run build` on CI; if persistent, investigate Next.js 15.5.x + `outputFileTracingRoot` in `next.config.ts` or disable parallel webpack cache. Until green, Lighthouse/CWV on production builds is unreliable.

### Warnings collected

| Warning | Source | Perf impact |
|---------|--------|-------------|
| `process.version` not supported in Edge Runtime | `@supabase/supabase-js` via `lib/supabase/middleware.ts` | Edge bundle bloat + potential runtime overhead |
| Serializing big strings (102 KiB, 244 KiB) | Webpack PackFileCacheStrategy | Slower **dev/build** cache I/O, not user-facing |
| Supabase in middleware import trace | Same as above | 316 KB middleware bundle (see below) |

### Bundle sizes (from partial successful build artifacts)

**Home route (`/`) — first-load JS (uncompressed, unique chunks): ~654.5 KB**

| Chunk | Size | Likely contents |
|-------|------|-----------------|
| `4bd1b696-*.js` | 172 KB | React / Next shared |
| `255-*.js` | 172 KB | Next app runtime |
| `472-*.js` | 188 KB | Supabase client + app shared |
| `44530001-*.js` | 64 KB | Lucide / category icons |
| `app/page-*.js` | 44 KB | RivlyApp, HomeView, DispatchView, constants |
| Other shared | ~15 KB | webpack, layout helpers |

**CSS:** `841b38b58c82cca5.css` — 28 KB (reasonable)

**Edge middleware:** `middleware.js` — **316 KB** (Supabase SSR client + auth refresh)

**Static data inlined in client bundle:**

- `lib/constants.ts` — ~7.5 KB (`DEMO_MERCHANTS` per category)
- `lib/i18n/messages/en.ts` + `fr.ts` — ~19 KB combined (both loaded via `LocaleProvider`)

**Other routes (for reference):**

- `/account/requests` — 24 KB page chunk (+ shared)
- `/pro/dashboard` — 12 KB page chunk (+ shared)

---

## API latency patterns

### Customer dispatch waterfall (logged-in, Supabase configured)

Sequential chain — no parallelization:

```
1. POST /api/classify          → Anthropic API (500ms–3s+) or demo fallback (~instant)
2. POST /api/jobs              → insert job + RPC dispatch_job + rate-limit count query
3. GET  /api/jobs?jobId=…      → job row + quotes join (after Realtime subscribe)
```

**Issues:**

- Steps 2→3 are strictly sequential in `completeDispatch()` even though subscribe could overlap with initial fetch.
- `GET /api/jobs?jobId` runs **two round-trips** server-side: `jobs` select, then `quotes` select with merchant join — could be one query or RPC.
- Each auth-gated route calls `supabase.auth.getUser()` independently (expected, but adds ~50–150 ms per hop).

### Realtime quote polling (`RivlyApp.subscribeToQuotes`)

```315:343:components/RivlyApp.tsx
  const subscribeToQuotes = (id: string) => {
    // ...
    .on("postgres_changes", { event: "*", ... }, async () => {
      const res = await fetch(`/api/jobs?jobId=${id}`);
      // re-fetches ALL quotes + re-sorts on ANY change
    })
```

- **Over-fetch:** Any insert/update/delete on `quotes` for the job triggers a full job+quotes API response.
- **Event breadth:** `event: "*"` includes deletes/expirations that may not need full list rebuild.
- **No debounce:** Rapid merchant quote submissions → request stampede.
- **Cleanup:** ✓ `channelCleanup` ref + `removeChannel` on reset/unmount — **no leak** on navigation within SPA.

### Middleware session refresh

```4:12:middleware.ts
export async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && ...) {
    return updateSession(request);  // supabase.auth.getUser() every matched request
  }
  return NextResponse.next();
}
```

Matcher excludes `_next/static` and images — good. Still adds edge cold-start + auth latency on **every HTML/document navigation**.

### Analytics (low risk)

`DispatchView` debounces filter logging 500 ms — appropriate.

---

## Supabase / database

### Indexes (schema.sql)

Present:

- `jobs (customer_id, created_at desc)` — supports rate limit + account list
- `jobs (category, status)` — dispatch feed
- `merchants` GIN on `categories`, `service_areas`
- `quotes` UNIQUE `(job_id, merchant_id)` — covers `job_id` lookups

**Minor gap:** No dedicated `quotes (job_id, created_at)` for ordered listing at scale; composite unique index may suffice for MVP quote counts (<20 per job).

### `dispatch_job` RPC

Single INSERT…SELECT with JOIN — efficient for batch quote creation. Promotion ordering in SQL avoids client-side sort on dispatch.

### Client-side Supabase on mount

`refreshUserProfile()` in `RivlyApp`:

1. `auth.getUser()`
2. `profiles` select
3. `syncProfileFromAuth()` (potential extra write)

Runs on mount **and** every `onAuthStateChange` — acceptable, but contributes to home TTI when logged in.

---

## Loading states & perceived performance

| Area | Behavior | Assessment |
|------|----------|------------|
| **LoadingSplash** | ~2.05 s first visit (650 ms enter + 1600 ms hold + 450 ms fade) | Delays first meaningful paint; `RivlyApp` mounts **under** splash (double work) |
| **Home submit** | Button shows "Dispatching…", disabled | ✓ Good |
| **Dispatch quotes** | Sonar dot + "Quoting" per card | ✓ Good UX |
| **Accept quote** | Per-card `acceptingQuoteId` disable | ✓ Good |
| **Suspense** | `fallback={null}` on home | No skeleton — blank flash possible on slow networks |
| **Demo mode** | Staggered `setTimeout` per merchant (1.2s + 900ms×N) | 6–8 sequential `setQuotes` → **6–8 re-renders** of full tree |

### Core Web Vitals (dev server, mobile 375×812)

Measured via CDP on `localhost:3000` (development mode — **not representative of production**):

| Metric | Observed | Notes |
|--------|----------|-------|
| TTFB | ~510 ms | Dev server overhead |
| DOMContentLoaded | ~548 ms | Repeat visit (no splash) |
| Load event | ~575 ms | |
| CLS | 0 | No layout shifts detected |
| LCP | Not captured | Requires PerformanceObserver from navigation start or Lighthouse on prod build |

First-visit splash adds **~2 s** before user can interact with the form (by design).

---

## Component render patterns

### RivlyApp — monolithic client state hub

- **15+ `useState` hooks** in one component; any quote/placeholder/auth update re-renders **Header + HomeView/DispatchView + AmbientBackground**.
- **No `React.memo`** on `HomeView`, `DispatchView`, or `Header`.
- **Placeholder rotation** (`setInterval` 3.2 s) runs regardless of `view` — wastes renders on dispatch screen.
- **`mapApiQuote`** defined inline — new function reference each render (minor).
- **Conditional views** unmount sibling (`home` vs `dispatch`) — good, but parent still re-renders entirely.

### HomeView

- Lightweight presentational component — ✓ appropriate split.
- **VoiceInput** always loaded (Web Speech API setup on mount) — acceptable; returns `null` on unsupported browsers.
- Category grid maps 8 icons — fine at this scale.

### DispatchView

- **`useMemo`** for `filteredQuotes` — ✓ good.
- Quote list renders up to ~8 cards with `pop-in` animation — fine; no virtualization needed yet.
- **`max-h-[480px] overflow-y-auto`** — contains layout; helps CLS.

### AppWithSplash

```23:27:components/AppWithSplash.tsx
  return (
    <>
      <RivlyApp />
      {showSplash && <LoadingSplash onComplete={handleSplashComplete} />}
    </>
  );
```

Both trees mount on first visit — RivlyApp fetches auth profile and sets intervals while splash overlays.

---

## Findings (full list)

### P0 — Release / measurement

| ID | Finding | Fix |
|----|---------|-----|
| P0-1 | `npm run build` fails at finalization (ENOENT) | Clean caches; verify CI; consider Next.js patch or config tweak |

### P1 — High impact

| ID | Finding | Fix | Effort |
|----|---------|-----|--------|
| P1-1 | Home first-load JS ~655 KB uncompressed; dispatch stack eagerly bundled | `next/dynamic` for `DispatchView`; lazy-load demo merchants; split auth/profile fetch | M |
| P1-2 | Realtime handler refetches full `/api/jobs` on every quote change | Handle `postgres_changes` payload directly or add `GET /api/jobs/:id/quotes` lightweight endpoint; debounce 300 ms | S |
| P1-3 | Edge middleware 316 KB + `getUser()` on every document request | Narrow matcher to auth routes only (`/account/*`, `/pro/*`, `/api/*`); or use cookie-only session check without full client | M |
| P1-4 | Classify → dispatch → fetch is strictly sequential | Start `subscribeToQuotes` + initial fetch in parallel with `dispatchJobClient` where safe | S |

### P2 — Medium impact

| ID | Finding | Fix | Effort |
|----|---------|-----|--------|
| P2-1 | Demo quote simulation: N separate `setQuotes` timeouts | Batch price updates in one `setQuotes` or use reducer | S |
| P2-2 | Placeholder interval runs on dispatch view | Gate interval on `view === "home"` | XS |
| P2-3 | LoadingSplash mounts full RivlyApp underneath | Defer RivlyApp mount until splash completes (or skeleton) | S |
| P2-4 | Both EN+FR message objects loaded always | Split locale bundles or dynamic import per locale | S |
| P2-5 | `GET /api/jobs?jobId` = 2 DB round-trips | Single query with embedded quotes or Postgres RPC | S |
| P2-6 | No route-level loading UI (`Suspense fallback={null}`) | Add lightweight skeleton for home hero | XS |
| P2-7 | Lucide: 9 icons imported in `category-icons.ts` + dispatch icons | Already tree-shaken per-icon; monitor chunk 44530001 (64 KB) | XS |

### P3 — Low / monitor

| ID | Finding | Fix |
|----|---------|-----|
| P3-1 | Animated ambient blobs + CSS gradients | Respect `prefers-reduced-motion` (splash already does) |
| P3-2 | Google fonts (Fraunces + Inter) | Already `display: swap`; consider `preload` for LCP text |
| P3-3 | Anthropic classify latency | Server-side only ✓; show progress during long classify |

---

## Recommended fix order

1. **Unblock build** (P0-1) — required for prod CWV baseline.
2. **Dynamic import DispatchView + defer splash mount** (P1-1, P2-3) — largest first-load win.
3. **Incremental quote updates via Realtime** (P1-2) — cuts dispatch-phase network and re-renders.
4. **RivlyApp render hygiene** (P2-1, P2-2) — quick wins, low risk.
5. **Middleware matcher tightening** (P1-3) — after auth flow regression test.

---

## Test plan (post-fix verification)

- [ ] `npm run build` exits 0; record First Load JS from build output table
- [ ] Lighthouse mobile on production build: LCP < 2.5 s, CLS < 0.1, INP < 200 ms
- [ ] Network tab: home loads ≤ 300 KB gzipped JS (target)
- [ ] Dispatch flow: ≤ 1 `/api/jobs` fetch per quote arrival (not N refetches for N merchants)
- [ ] Navigate home → dispatch → reset: no orphaned Supabase channels (DevTools WS count)
- [ ] First visit splash: form interactive within 1 s (if splash shortened)
- [ ] Logged-in Cannes grocery request end-to-end < 5 s to first quote card (excl. merchant response)

---

## Appendix: commands run

```bash
npm run build                    # failed finalization (3 attempts)
rm -rf .next && npm run build    # same class of ENOENT errors
node -e '...'                    # home route chunk sum from app-build-manifest.json
du -h .next/static/chunks/*.js   # chunk sizes
```

Browser: `localhost:3000` @ 375×812, CDP Performance API (dev mode).

---

*Auditor: Cursor agent · Playbook §3.6 · No code changes committed.*
