# Rivly — simple setup (3 steps)

No coding experience needed. About 5 minutes.

## Step 1 — Paste the SQL once

1. Open the SQL editor for your project:  
   **[Open SQL editor →](https://supabase.com/dashboard/project/kivwsfwijgbwflvsrtqy/sql/new)**
2. On your computer, open the file **`supabase/00_RUN_THIS_IN_SUPABASE.sql`** (inside this project folder).
3. Select all the text, copy it, paste it into Supabase, click **Run**.
4. You should see “Success” — that creates all the tables Rivly needs.

**Optional (live quote updates):** paste this one line in the same SQL editor and run it:

```sql
alter publication supabase_realtime add table public.quotes;
```

You can skip this for your first test — the app still works; quotes may just not update instantly on screen.

Also in Supabase: **Authentication → Providers → Email** — make sure Email is turned **on** (password sign-up).

## Step 2 — Copy one key

1. In Supabase, click the **gear icon** (Project Settings) at the bottom left.
2. Click **API**.
3. Find **anon public** and click **Copy**.
4. Keep that copied — you will paste it in the next step.

## Step 3 — Run one command

Open Terminal in this project folder and run:

```bash
npm run setup
```

When it asks for the anon key, paste what you copied in Step 2 and press Enter.

If everything is green, start the app:

```bash
./scripts/dev.sh
```

Then open **http://localhost:3000** in your browser.

---

**Stuck?** The wizard prints plain-English fixes if something fails. For more detail, see [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md).
