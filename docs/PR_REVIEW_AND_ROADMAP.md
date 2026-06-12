# myfr.ai — PR review + improvements & automation roadmap
Reviewed 2026-06-12 against origin/main @ 4ea7bc9 and open PRs #2, #3.

## Part 1 — State of the open PRs

### PR #1 — merchant /pro side  ✅ MERGED into main
Signup, dashboard, quote-submission routes, plus the merchant RLS
policies my schema left as TODO. The quote-submission route
(`app/api/merchants/quotes/route.ts`) is well done: validates price > 0,
checks merchant owns the quote, blocks double-submit via status guard,
flips job to `quoted`. No changes needed.

### PR #2 — design/alive-v1  ✅ SAFE TO MERGE
CSS-only motion layer. No logic touched. Superseded by PR #3 (which
contains it), so **close #2 and merge via #3** to avoid a double-apply
conflict on globals.css.

### PR #3 — OAuth + journey + blocker fixes  ⚠️ MERGE AFTER 3 FIXES
Contains the design layer + OAuth (Google/Apple) + acceptance fix.

Blocker resolution status:
- Blocker #1 (acceptance not persisted): **FIXED.** New PATCH in
  `app/api/jobs/route.ts` — ownership check, accept quote, reject
  siblings, set `accepted_quote_id` + job `accepted`. Correct logic.
- Blocker #2 (demo quotes shown to real users): **NOT FIXED.**
  `RivlyApp.tsx` still calls `simulateDemoQuotes()` when
  `dispatched === 0` even with Supabase live (lines ~271, ~274). A real
  logged-in customer in an unmatched category still sees fake pros.

New issues introduced by PR #3:
1. **Acceptance is not atomic (HIGH).** The PATCH does three sequential
   `.update()` calls, not one transaction. If the process dies between
   "accept quote" and "set job accepted", you get an accepted quote on a
   job that still looks open — or two siblings in a race both reaching
   accept. My review specified an `accept_quote()` security-definer RPC
   for exactly this. Still the right call; the route should call the RPC,
   not hand-roll three writes.
2. **Channel leak still present (HIGH).** `subscribeToQuotes` returns a
   cleanup closure that no caller stores. `reset()` never closes the
   channel. Same finding as my first review — the return value is created
   and dropped. Needs a `cleanupRef`.
3. **OAuth `next` param is an open redirect (MEDIUM).** `callback/route.ts`
   redirects to `${origin}${next}` with no validation. A crafted
   `?next=https://evil.com` (or `//evil.com`) can bounce a freshly
   authed user off-site. Allow only paths starting with a single `/`.

Also missing from blocker fixes (from first review, still open):
- Job payload validation + rate limit on POST /api/jobs (#4 in first
  review) — not addressed.
- Profile prefs race (#5) — partially mooted by OAuth metadata sync, but
  the email/password path still upserts; low priority.

### Merge plan (give this to Claude Code)
1. On the PR #3 branch, apply the 3 fixes below.
2. `npm run build` (needs network for Google Fonts, or set
   `next/font` to a local fallback in CI).
3. Squash-merge #3 into main. Close #2.
4. Run the two new migrations in Supabase SQL editor.

---

## Part 2 — Fixes to apply before merge (concrete)

### Fix A — atomic acceptance RPC
`supabase/migrations/002_accept_quote.sql`:
```sql
create or replace function accept_quote(p_job_id uuid, p_quote_id uuid)
returns void language plpgsql security definer as $$
begin
  if not exists (
    select 1 from jobs
    where id = p_job_id and customer_id = auth.uid()
      and status in ('dispatched','quoted')
  ) then
    raise exception 'job not acceptable';
  end if;
  if not exists (
    select 1 from quotes
    where id = p_quote_id and job_id = p_job_id
      and status = 'submitted' and price_eur is not null
  ) then
    raise exception 'quote not acceptable';
  end if;

  update quotes set status = 'accepted' where id = p_quote_id;
  update quotes set status = 'rejected'
    where job_id = p_job_id and id <> p_quote_id
      and status in ('pending','submitted');
  update jobs set accepted_quote_id = p_quote_id, status = 'accepted'
    where id = p_job_id;
end $$;
```
Then the PATCH handler becomes one `supabase.rpc('accept_quote', …)`.

### Fix B — close the realtime channel
In `RivlyApp.tsx`:
```ts
const channelCleanup = useRef<(() => void) | null>(null);
// in completeDispatch, before subscribing:
channelCleanup.current?.();
channelCleanup.current = subscribeToQuotes(id) ?? null;
// in reset() and an unmount useEffect:
channelCleanup.current?.(); channelCleanup.current = null;
```

### Fix C — honest empty state (kills blocker #2 for real)
```ts
if (dispatched === 0) {
  if (isSupabaseConfigured()) {
    setQuotes([]); setMerchantCount(0);   // show t.dispatch.noMerchantsYet
    return;
  }
  simulateDemoQuotes(req.classification); // demo only when no backend
}
```

### Fix D — safe redirect
In `callback/route.ts`:
```ts
const raw = searchParams.get("next") ?? "/";
const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
```

### Fix E — validate + rate-limit POST /api/jobs
Guard category/urgency against the enums, cap string lengths, and:
```ts
const since = new Date(Date.now() - 3600_000).toISOString();
const { count } = await supabase.from("jobs")
  .select("id", { count: "exact", head: true })
  .eq("customer_id", user.id).gte("created_at", since);
if ((count ?? 0) >= 5)
  return NextResponse.json({ error: "Rate limit" }, { status: 429 });
```

---

## Part 3 — Product improvements (ranked by leverage)

1. **Job completion + auto-release loop.** There's no "mark complete"
   anywhere. Without it nothing closes and Phase 4 escrow can't release.
   Add: customer "mark complete" → job `completed`, set `completed_at`;
   72h auto-release fallback. This is the missing half of the core loop.
2. **Merchant notifications.** Pros won't sit on the dashboard. Email via
   Resend on dispatch is the minimum; WhatsApp (360dialog/Twilio) is the
   real unlock for Riviera pros. Without this, quote latency kills the UX.
3. **Customer job history.** A logged-in user has no "my requests" view.
   One page querying `jobs` by `customer_id` with status badges. Cheap,
   high retention value.
4. **Reviews after completion.** `merchants.rating` is static seed data.
   Add a `reviews` table, prompt the customer post-completion, recompute
   rating. This is what makes the marketplace defensible vs the FB groups.
5. **Quote expiry cron.** Schema sets `expires_at` (+4h) but nothing
   enforces it. Vercel Cron or pg_cron: expire stale `pending` quotes and
   re-dispatch to the next-best merchant.
6. **Admin verification UI.** Merchant approval is a SQL script today.
   A minimal `/admin` (email allowlist) with a Verify button removes you
   from the loop and lets you onboard pros from your phone.
7. **SEO category×city landing pages.** `/housekeeping/cannes` etc.,
   server-rendered. These match exactly what FB-group members google.
   Each page funnels into the request box pre-filled.

---

## Part 4 — Automations (build vs. ops)

### CI/CD (do first — protects the multi-agent workflow)
- **GitHub Actions on PR:** `npm ci && npm run build && npx tsc --noEmit`.
  With Cursor, Claude Code, and design branches all landing, an automated
  gate prevents one agent breaking another's work. Set Google Fonts to a
  bundled fallback so CI builds offline.
- **Branch protection on main:** require the Action to pass + 1 review.
- **Preview deploys:** Vercel auto-preview per PR → every branch gets a
  live URL to click through (huge for reviewing design/UX PRs).

### Product automations (the AI dispatch edge)
- **Server-side re-classification confidence.** Have the classifier also
  return a confidence score; low confidence → ask the clarifying question
  before dispatching instead of after. Fewer bad dispatches to pros.
- **Auto-recruit from supply gaps.** Every `dispatched === 0` job is a
  logged demand signal. Weekly job: group unmatched jobs by category×city,
  output a "recruit these merchant types here" list. Turns the empty
  state into a growth engine.
- **Smart merchant ranking.** `dispatch_job` currently orders by rating +
  jobs_completed. Add response-rate and win-rate so reliable pros get
  first dibs — self-reinforcing quality.
- **Draft-quote assist for merchants.** Claude suggests a price range +
  message from the job text; merchant edits and sends. Cuts quote latency,
  the #1 marketplace conversion lever.
- **Multilingual auto-translation.** Store `raw_request` language; show
  merchants their preferred language, customers theirs. The classifier
  already handles FR/EN input — extend to display.

### Ops automations
- **Nightly DB snapshot** of jobs/quotes/transactions (Supabase scheduled
  backup is on by default — verify the tier).
- **Weekly metrics digest** (Supabase scheduled function → email): jobs by
  category, match rate, quote→accept conversion, supply gaps. Your
  operating dashboard without building a dashboard.

---

## Suggested immediate sequence
1. Apply Fixes A–D on PR #3 branch → merge → run migration 002.
2. Add GitHub Actions build gate + branch protection.
3. Build job-completion loop (Improvement #1) — closes the core loop.
4. Resend dispatch notifications (#2) — makes the loop actually move.
5. Then Phase 4 (Stripe Connect) has every hook it needs.
