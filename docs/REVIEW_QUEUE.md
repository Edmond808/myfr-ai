# Review Queue

**GitHub:** https://github.com/Edmond808/myfr-ai

## Simultaneous work (Cursor + Claude)

| Workspace | Path | Branch convention |
|-----------|------|-------------------|
| **Cursor** | `/Users/e808m/myfr.ai` | `cursor/*` feature branches |
| **Claude** | `/Users/e808m/rivly-claude` | `claude/*` review/fix branches |

Both clones share one repo (`origin` → GitHub `Edmond808/myfr-ai`; rivly-claude may also use local `/Users/e808m/myfr.ai`). Before starting work: `git fetch origin && git pull origin main`. After pushing a branch, append a line here. Full loop: `docs/TEAM_WORKFLOW.md`.

**Current sync:** main @ `0a1f915` — skills audit handoff + a11y/i18n fixes pushed. Claude: pull main, review `.cursor/SKILLS.md` and `docs/audits/`.

## Open items

- [2026-06-12] [CURSOR] [main @ 883ce27] — **Claude: review latest main.** PRs #8–#10 merged. See Completed below. Run migrations `003`, `004`, `005` in Supabase. Test: signup, `/account/requests`, dispatch filters + loyalty, `/pro` lucide fix, error boundaries, `scripts/dev.sh` on port 3000.

- [2026-06-12] [CURSOR] [cursor/simple-setup] — Non-dev setup: `docs/SETUP_SIMPLE.md`, `npm run setup` wizard, OAuth hidden behind "More options". Needs review: run wizard flow on fresh clone.

- [2026-06-12] [CURSOR] [main] — Phase 3 item 3 still open: Resend email notifications on merchant dispatch.

- [2026-06-12] [CURSOR] [main] — **User action:** Enable branch protection on `main` (require CI + 1 review). See `docs/PR_REVIEW_AND_ROADMAP.md` Part 4.

## Claude reviews

- [2026-06-12] [CLAUDE] — Reviewed PRs #2/#3; handoff at `docs/PR_REVIEW_AND_ROADMAP.md`. Fixes A–E applied on `cursor/phase-3-oauth-journey` before merge.

- [2026-06-12] [CLAUDE] — **Start here:** `git checkout main && git pull`. Main @ `883ce27` includes loyalty (#8), promoted quotes + filters (#9), signup/error-boundary/My-requests/dev.sh fixes (#10). Docs: `docs/LOYALTY.md`, `docs/PROMOTIONS.md`, `docs/SUPABASE_AUTH.md`.

- [2026-06-12] [CURSOR] [main] — **Skills audit handoff.** `.cursor/SKILLS.md`, `.cursor/AUDIT_PLAYBOOK.md`, `docs/audits/2026-06-12-*.md` (security, performance, browser QA, a11y/i18n). Code fixes: form labels, `format-eta` i18n, `LocaleProvider` `lang`, loyalty/dispatch a11y. Review audit reports before next feature work.

## Completed

- [2026-06-12] Initial Vite prototype migrated from Downloads JSX
- [2026-06-12] Phase 1 — Vite → Next.js App Router + `/api/classify`
- [2026-06-12] Phase 2 — Supabase schema, auth gate, job persistence API (code ready; Supabase project TBD)
- [2026-06-12] VoiceInput — Web Speech API with interim preview, EN/FR locale
- [2026-06-12] `npm run build` passes (Next.js 15.5.19)
- [2026-06-12] [main @ bb35594] — Phase 1-2 pushed to GitHub: Next.js + Supabase schema/API, auth (register/login), EN/FR i18n, VoiceInput
- [2026-06-12] [main @ 4ea7bc9] — Phase 3 merchant signup/dashboard merged (PR #1)
- [2026-06-12] [cursor/phase-3-oauth-journey] — Claude review fixes: atomic `accept_quote` RPC, realtime channel cleanup, honest empty state, OAuth redirect hardening, POST /api/jobs validation + rate limit, GitHub Actions CI
- [2026-06-12] PR #3 merged (OAuth + journey + alive-v1 design). PR #2 closed (superseded by #3).
- [2026-06-12] PR #7 merged — auth-after-quotes (anonymous demo quotes before register).
- [2026-06-12] PR #8 merged — Riviera Club loyalty UX on dispatch quotes.
- [2026-06-12] PR #9 merged — sponsored quote placement, quote filter bar, full pro dispatch, lucide server fix.
- [2026-06-12] PR #10 merged — signup `handle_new_user` fix, App Router error boundaries, `/account/requests`, dev.sh port cleanup, dispatch error UX.

## Next

1. Run migrations `003_loyalty_tier.sql`, `004_promoted_and_analytics.sql`, `005_fix_handle_new_user.sql` in Supabase (if not already)
2. Job completion loop (Improvement #1 in roadmap)
3. Resend dispatch notifications
4. Phase 4 — Stripe Connect (`docs/STRIPE_CONNECT.md`)
