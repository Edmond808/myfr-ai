# myfr.ai — go-live setup (≈15 minutes)

You do the steps that touch secrets and your account. The files here remove
all the thinking. Tick them in order.

## 1. Create the Supabase project (2 min)
- supabase.com → New project.
- **Region: Frankfurt (eu-central-1) or Paris** — GDPR, your users are EU.
- Set a strong database password (save it in your password manager).
- Wait for "Project is ready".

## 2. Create the database (2 min)
- Dashboard → SQL Editor → New query.
- Open [`supabase/00_RUN_THIS_IN_SUPABASE.sql`](../supabase/00_RUN_THIS_IN_SUPABASE.sql), copy the whole file, paste, click **Run**.
- Expect "Success. No rows returned". That built all 5 tables, the RLS
  policies, the dispatch_job + accept_quote functions, and the merchant feed.

## 3. Turn on Realtime (30 sec)
- Dashboard → Database → Replication (newer projects: **Realtime**).
- Enable replication for the **`quotes`** table only.
- This is what makes quotes appear live on the customer + merchant screens.

## 4. Turn on auth (1 min)
- Dashboard → Authentication → Providers.
- Enable **Email** (required).
- Optional now, easy later: Google / Apple. Redirect URL to add when you do:
  `https://YOUR_DOMAIN/auth/callback` (and `http://localhost:3000/auth/callback`
  for local). Details in the repo's [`docs/SUPABASE_AUTH.md`](SUPABASE_AUTH.md).

## 5. Wire the keys (2 min)
- Dashboard → Project Settings → API. Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- In your repo root: `cp .env.example .env.local`, paste those two values plus
  your `ANTHROPIC_API_KEY`. Save.
- `.env.local` is gitignored — never commit it.

## 6. Verify it actually works (1 min)
From the repo root:
```
npm run check:supabase
```
Green ticks across the board = wired correctly. Any red line tells you the
exact step to redo.

## 7. Run it (1 min)
```
npm install
npm run dev
```
Open http://localhost:3000 → type a request → register → you should land on
the dispatch screen. With no verified merchants yet you'll see the honest
"no pros cover this yet" state (correct!).

## 8. Make yourself a test merchant (2 min)
- Go to `/pro`, sign up a merchant in a category + city you'll test (e.g.
  housekeeping / Cannes).
- Dashboard → SQL Editor → open [`scripts/verify-merchant.sql`](../scripts/verify-merchant.sql) from the repo,
  find your merchant, set status to `verified`.
- Now submit a customer request in that category → it dispatches to your
  merchant → quote from `/pro/dashboard` → watch it appear live on the
  customer screen. That's the full loop working end to end.

## When you deploy (Vercel)
- Import the GitHub repo in Vercel.
- Add the same 3 env vars in Vercel → Settings → Environment Variables.
- Add your production `/auth/callback` URL to Supabase auth redirect allowlist.
- Deploy.

---
**What I could not do for you and why:** creating the project, pasting keys,
and enabling providers all involve your credentials and account settings —
the kind of irreversible, secret-touching actions that should stay in your
hands. Everything around them is pre-built here so each step is paste-and-go.
