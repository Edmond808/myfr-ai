# Review Queue

**GitHub:** https://github.com/Edmond808/myfr-ai

## Simultaneous work (Cursor + Claude)

| Workspace | Path | Branch convention |
|-----------|------|-------------------|
| **Cursor** | `/Users/e808m/myfr.ai` | `cursor/*` feature branches |
| **Claude** | `/Users/e808m/rivly-claude` | `claude/*` review/fix branches |

Both clones share one repo (`origin` → GitHub `Edmond808/myfr-ai`; rivly-claude may also use local `/Users/e808m/myfr.ai`). Before starting work: `git fetch origin && git pull origin main`. After pushing a branch, append a line here. Full loop: `docs/TEAM_WORKFLOW.md`.

**Current sync:** main @ `909dc76` — dual-workspace note + skills audit handoff. Claude: pull main, review `.cursor/SKILLS.md` and `docs/audits/`.

## Open items

- [2026-06-12] [CURSOR] [main @ 883ce27] — **Claude: review latest main.** PRs #8–#10 merged. See Completed below. Run migrations `003`, `004`, `005` in Supabase. Test: signup, `/account/requests`, dispatch filters + loyalty, `/pro` lucide fix, error boundaries, `scripts/dev.sh` on port 3000.

- [2026-06-12] [CURSOR] [cursor/simple-setup] — Non-dev setup: `docs/SETUP_SIMPLE.md`, `npm run setup` wizard, OAuth hidden behind "More options". Needs review: run wizard flow on fresh clone.

- [2026-06-12] [CURSOR] [main] — Phase 3 item 3 still open: Resend email notifications on merchant dispatch.

- [2026-06-12] [CURSOR] [main] — **User action:** Enable branch protection on `main` (require CI + 1 review). See `docs/PR_REVIEW_AND_ROADMAP.md` Part 4.

## Audits

- [2026-06-12] [CURSOR] [cursor/mobile-app @ `0a1f915`] — **Parallel audit (5 lenses + synthesizer).** Branch identical to `main`; mobile scaffold untracked. **6 deduplicated P0**, 22 P1. Security P0s documented only (require migrations, not applied).
  - [Master summary](./audits/parallel-audit-2026-06-12/master-summary.md)
  - [Security](./audits/parallel-audit-2026-06-12/security.md) — P0:1 P1:4 P2:9
  - [Customer journey](./audits/parallel-audit-2026-06-12/customer-journey.md) — P0:2 P1:6 P2:7
  - [Pro journey](./audits/parallel-audit-2026-06-12/pro-journey.md) — P0:2 P1:10 P2:7
  - [Data layer](./audits/parallel-audit-2026-06-12/data-layer.md) — P0:2 P1:9 P2:6
  - [Mobile code review](./audits/parallel-audit-2026-06-12/code-review.md) — P0:1 P1:5 P2:7
  - **Fix first:** migration `006` for `dispatch_job` + feed view; accept errors on dispatch; resume quote after auth; align `00_RUN_THIS_IN_SUPABASE.sql`; commit `mobile/`.

- [2026-06-12] [CURSOR] [main] — **Security+auth audit:** [security-auth-audit-2026-06-12.md](./audits/security-auth-audit-2026-06-12.md) (P0=2, P1=5). Priority: harden `dispatch_job` RPC, merchant status guard, merchant PII view. Read-only; patches proposed, not applied.

- [2026-06-12] [CURSOR] [main] — **i18n/copy audit:** [i18n-copy-review-2026-06-12.md](./audits/i18n-copy-review-2026-06-12.md) — 28 issues; **185/185 key parity**; hardcoded EN in `global-error`, API errors, RivlyApp ETA; FR anglicisms + dispatch jargon. Top fixes: `home.dispatchError`, `global-error.tsx`, `loyalty.signUpToUnlock`.

- [2026-06-12] [CURSOR] [main] — **Classify→dispatch pipeline review** (playbook §3.3): [classify-dispatch-pipeline-review-2026-06-12.md](./audits/classify-dispatch-pipeline-review-2026-06-12.md). Top risks: `dispatch_job` RPC auth (P0), `/api/classify` rate limit (P1), client-trusted classification on POST /api/jobs (P1). `lib/classify.ts` flagged for human review only — no prompt edits.

- [2026-06-12] [CURSOR] [main] — **Playbook audits** (§3.2–3.7; `.cursor/SKILLS.md`, `.cursor/AUDIT_PLAYBOOK.md`):
  - [Pre-release browser QA](./audits/2026-06-12-browser-qa.md) — Cannes demo flow pass; analytics 500; `.next` corruption if build during dev
  - [Security + auth](./audits/2026-06-12-security.md) — RPC/RLS gaps, `/api/classify` rate limit, auth boundary matrix
  - [Performance](./audits/2026-06-12-performance.md)
  - [Accessibility & i18n](./audits/2026-06-12-accessibility-i18n.md) — form labels, `format-eta` i18n, `LocaleProvider` `lang`, loyalty/dispatch a11y fixes applied in code

## Claude reviews

- [2026-06-12] [CLAUDE] — Reviewed PRs #2/#3; handoff at `docs/PR_REVIEW_AND_ROADMAP.md`. Fixes A–E applied on `cursor/phase-3-oauth-journey` before merge.

- [2026-06-12] [CLAUDE] — **Start here:** `git checkout main && git pull`. Main @ `883ce27` includes loyalty (#8), promoted quotes + filters (#9), signup/error-boundary/My-requests/dev.sh fixes (#10). Docs: `docs/LOYALTY.md`, `docs/PROMOTIONS.md`, `docs/SUPABASE_AUTH.md`.

- [2026-06-12] [CURSOR] [main] — **Skills audit handoff.** `.cursor/SKILLS.md`, `.cursor/AUDIT_PLAYBOOK.md`. Code fixes from playbook audits applied (form labels, `format-eta` i18n, `LocaleProvider` `lang`, loyalty/dispatch a11y). See **Audits** above.

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
