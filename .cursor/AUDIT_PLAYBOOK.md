# myfr.ai Audit Playbook

Practical guide for using **65 personal skills** (`~/.cursor/skills/`) plus **15 built-in skills** (`~/.cursor/skills-cursor/`) to run Research & Development, QA, and full audit-team workflows on the myfr.ai marketplace prototype.

**Index:** `.cursor/SKILLS.md` · **Project context:** `AGENTS.md` · **Handoff queue:** `docs/REVIEW_QUEUE.md`

---

## 1. How Cursor skills work

### What a skill is

Each skill is a folder with a `SKILL.md` file containing YAML frontmatter (`name`, `description`) and step-by-step instructions. The agent reads the full file when the skill applies.

| Location | Scope | Edit? |
|----------|-------|-------|
| `~/.cursor/skills/` | Personal — all projects | Yes (your 65 installed skills) |
| `~/.cursor/skills-cursor/` | Built-in Cursor skills | **No** — managed by Cursor |
| `.cursor/skills/` | Project — shared via git | Yes (not used yet on myfr.ai) |

### When agents auto-use skills

Agents see skill **names and descriptions** in every session. When your request clearly matches a description, the agent should **read `SKILL.md` immediately** and follow it — no @-mention required.

**Auto-triggers well:**
- "QA the home page in the browser" → `visual-qa-testing`, `verifying-in-browser`
- "Review this PR for security" → `auditing-security`, `reviewing-code`
- "CI is red on my branch" → `parallel-ci-triage`, `grinding-until-pass`
- "Keep PR #12 merge-ready" → `babysitting-pr` or built-in `babysit`

**May not auto-trigger** (vague or multi-domain requests):
- "Check the app" — too broad; name the workflow or skill
- "Make it better" — no skill match
- Competing skills (e.g. `babysit` vs `babysitting-pr`) — specify which

### When you should @-mention or name the skill

Use an explicit skill reference when:

1. **You want a specific workflow** — e.g. `parallel-code-review` not a generic "review my code"
2. **The task is multi-step** — parallel audits, browser + network + a11y in one pass
3. **Auto-invocation is disabled** — skills with `disable-model-invocation: true` in frontmatter require @-mention
4. **You are teaching the team** — paste the skill name in `docs/REVIEW_QUEUE.md` handoff notes

**Ways to invoke:**
```
Use the parallel-code-review skill on my current branch vs main.
@parallel-code-review
Follow ~/.cursor/skills/visual-qa-testing/SKILL.md — test the Cannes grocery dispatch flow.
```

### Built-in vs installed overlap

| Goal | Prefer | Alternative |
|------|--------|-------------|
| Keep PR green | `babysitting-pr` (detailed gh workflow) | built-in `babysit` (lighter) |
| Suggest a hook | `suggesting-cursor-hooks` | `create-hook` (author the hook) |
| Suggest a rule | `suggesting-cursor-rules` | `create-rule` (author the rule) |
| Split large branch | built-in `split-to-prs` | `creating-pr` (single PR) |

---

## 2. Audit team roles → skills

Treat skills as **expert personas**. Assign one persona per agent in Multitask Mode, or run them sequentially for smaller changes.

| Persona | Primary skills | myfr.ai focus areas |
|---------|----------------|---------------------|
| **Security auditor** | `auditing-security`, `reviewing-code` | `/api/classify`, `/api/jobs` rate limits, Supabase RLS, no client-side `ANTHROPIC_API_KEY`, OAuth redirects (`docs/SUPABASE_AUTH.md`) |
| **Performance engineer** | `auditing-performance`, `profiling-performance`, `tailing-build-output` | `RivlyApp` state, dispatch quote polling, bundle size, Core Web Vitals on mobile |
| **Accessibility specialist** | `accessibility-auditing`, `responsive-testing`, `dark-mode-testing` | `HomeView` form, `VoiceInput`, quote cards, `/pro` dashboard tables |
| **QA tester** | `visual-qa-testing`, `form-testing`, `verifying-in-browser`, `network-request-auditing` | Cannes grocery request → quotes → accept; merchant signup → submit quote |
| **API / integration tester** | `api-smoke-testing`, `systematic-debugging` | All routes under `app/api/`, demo mode without API key |
| **Copywriter / i18n** | `writing-copy`, `verifying-markdown-formatting` | `lib/i18n/messages/en.ts` + `fr.ts`, brand `myfr.ai`, Riviera tone |
| **SEO / marketing** | `seo-auditing`, `writing-copy` | Landing meta, OG tags, structured data for local services |
| **Design system** | `using-ui-stack`, `screenshotting-changelog` | Navy `#10324A`, azure `#2B86BC`, amber `#E2992F`, Fraunces + Inter |
| **DB / schema reviewer** | `database-design`, `reviewing-code` | `schema.sql`, 8 categories sync with `lib/types.ts`, migrations `003`–`005` |
| **CI / release engineer** | `babysitting-pr`, `parallel-ci-triage`, `grinding-until-pass`, `setting-up-ci` | GitHub Actions, `npm run build`, branch protection on `main` |
| **Architect / tech lead** | `architecture-decision-records`, `codebase-onboarding`, `parallel-exploring` | Phase 4 Stripe, Resend notifications, dual-team handoff |
| **Claude review counterpart** | `reviewing-code`, `creating-pr` | Findings → `docs/REVIEW_QUEUE.md` under "Claude reviews" |

---

## 3. Ready-to-run prompt templates

Copy-paste into Cursor Agent. Adjust branch names and PR numbers as needed.

### 3.1 Full app audit (parallel)

```
Run a full myfr.ai audit using parallel explore and parallel-code-review patterns.

Context: Next.js 15 App Router marketplace for Côte d'Azur. Read AGENTS.md and docs/REVIEW_QUEUE.md first.

Launch parallel read-only subagents (one message, multiple Task calls):
1. Security — app/api/*, lib/supabase/*, auth flows, secrets in client code
2. Customer journey — RivlyApp, HomeView, DispatchView: anonymous classify → dispatch → accept quote (Cannes grocery example)
3. Pro journey — /pro signup, MerchantDashboard, quote submit, scripts/verify-merchant.sql
4. Data layer — schema.sql, 8 categories vs lib/types.ts, migrations 003–005

Then run parallel-code-review on git diff origin/main...HEAD (or main if on main).

Deliver: prioritized findings (P0/P1/P2), no code changes unless P0 security. Append summary to docs/REVIEW_QUEUE.md under a new audit entry.
```

### 3.2 Pre-release QA pass

```
Pre-release QA for myfr.ai on branch <branch-name>.

Follow visual-qa-testing and verifying-in-browser skills:
1. npm run build — must pass
2. Start dev server (scripts/dev.sh or npm run dev on port 3000)
3. Customer flow: submit "I need groceries delivered in Cannes tomorrow" → verify classify → dispatch → filter quotes → accept
4. Pro flow: /pro signup → dashboard → submit quote on open job
5. Auth: register/login, /account/requests if logged in
6. Demo mode: works without ANTHROPIC_API_KEY
7. Mobile: responsive-testing at 375px and 768px
8. network-request-auditing on dispatch — no failed /api/classify or /api/jobs calls

Report checklist from AGENTS.md review checklist with pass/fail per item. Screenshot failures.
```

### 3.3 Classify / dispatch flow review

```
Review the classify → dispatch pipeline (core IP). Read-only unless I approve fixes.

Scope:
- lib/classify.ts — DO NOT MODIFY (review only; flag issues for human review)
- app/api/classify/route.ts — server-side Anthropic only
- components/RivlyApp.tsx, DispatchView — state, error UX, loyalty/promotions
- 8 categories: lib/types.ts, schema.sql enum, classifier prompt must stay in sync

Use reviewing-code + api-smoke-testing:
- POST /api/classify with Cannes grocery sample (with and without API key)
- Verify category mapping, merchant routing, rate limiting on /api/jobs
- Check anonymous classify OK vs auth required at dispatch (MIGRATION_PLAN Phase 2)

Output: flow diagram (mermaid), risk list, test gaps. No classify prompt edits.
```

### 3.4 Pro merchant dashboard review

```
Audit /pro merchant experience using form-testing and visual-qa-testing.

Test:
1. MerchantSignupForm — valid/invalid SIRET, categories, EN/FR toggle
2. MerchantDashboard — job feed, quote form, lucide icons (no server component errors)
3. Manual verification path: scripts/verify-merchant.sql
4. Full pro dispatch after PR #9 — promoted quotes visible to customer?

Use responsive-testing on dashboard tables. Report UX friction for first 50 manual-verify merchants (project rule).
```

### 3.5 Security + auth audit

```
Security + auth audit for myfr.ai. Follow auditing-security skill strictly. Read-only.

Check:
- OWASP Top 10 on API routes (classify, jobs, merchants)
- Supabase auth: session handling, OAuth redirect hardening (docs/SUPABASE_AUTH.md)
- RLS policies in schema.sql / migrations
- No secrets in git or client bundles
- POST /api/jobs validation + rate limits
- accept_quote RPC atomicity

Deliver: severity-ranked report. P0/P1 only get proposed patches; lib/classify.ts is review-only.
```

### 3.6 Performance audit

```
Performance audit for myfr.ai. Use auditing-performance and profiling-performance.

Measure:
- npm run build output / bundle concerns
- Home → dispatch cold load, quote polling behavior
- Core Web Vitals signals (LCP, CLS) on mobile viewport
- Supabase realtime channel cleanup (no leaks on navigation)

Profile dispatch view in browser. Suggest max 3 high-impact fixes with effort estimate. No refactors unless asked.
```

### 3.7 i18n / copy review

```
i18n and copy review for myfr.ai. Use writing-copy skill.

Review:
- lib/i18n/messages/en.ts and fr.ts — parity, missing keys, Riviera tone
- Brand: myfr.ai in BRAND constant and i18n brand field
- VoiceInput EN/FR locales
- Error messages on dispatch, signup, /account/requests
- loading splash, loyalty (docs/LOYALTY.md), promotions copy

Output: side-by-side EN/FR table of issues + suggested rewrites. Do not change lib/classify.ts.
```

### 3.8 CI / PR babysitting

```
Babysit PR #<number> on myfr.ai. Use babysitting-pr skill (or babysit for quick triage).

1. gh pr view — status, checks, unresolved comments
2. git fetch && merge latest main if branch is behind
3. npm run build locally on PR branch
4. parallel-ci-triage if multiple CI jobs fail — one subagent per job
5. Push scoped fixes only; never weaken CI rules to greenwash
6. When merge-ready, note in docs/REVIEW_QUEUE.md

Target: green CI, conflicts resolved, valid Bugbot/review comments addressed.
```

---

## 4. Multitask Mode & parallel agents

**Multitask Mode** lets multiple agents run in one session. Pair it with skills that explicitly launch parallel subagents.

### Pattern: one message, N agents

The parent agent sends **one user message** with multiple `Task` tool calls (or you paste a prompt that requests parallel launches). Each subagent returns independently; the parent synthesizes.

| Skill | Parallelism | Subagent type | Read-only? |
|-------|-------------|---------------|------------|
| `parallel-code-review` | 4 reviewers | `explore` | Yes |
| `parallel-exploring` | N codebase zones | `explore` | Yes |
| `parallel-ci-triage` | 1 per failing CI job | `generalPurpose` or `ci-investigator` | No (fixes) |
| `parallel-test-fixing` | 1 per test file | `generalPurpose` | No |
| `codebase-onboarding` | Architecture zones | `explore` | Yes |
| `best-of-n-solving` | N solution attempts | worktree isolation | No |

### Example: audit squad in Multitask Mode

Enable Multitask Mode, then paste **§3.1 Full app audit**. The parent should:

1. Read `docs/REVIEW_QUEUE.md` for open items
2. Launch 4 `explore` subagents (security, customer, pro, data)
3. Optionally add `accessibility-auditing` + `network-request-auditing` via browser MCP
4. Merge into one report with P0–P2 priorities

### Browser-heavy parallel QA

These skills need **cursor-ide-browser** MCP (enabled in this workspace):

`visual-qa-testing`, `verifying-in-browser`, `form-testing`, `accessibility-auditing`, `responsive-testing`, `network-request-auditing`, `profiling-performance`

Run browser QA **after** `npm run build` passes — don’t parallelize build fixes with browser tests on a broken branch.

### Built-in helpers

- **`babysit`** — lighter PR loop when you only need green CI
- **`split-to-prs`** — break a large `cursor/*` branch before audit
- **`canvas`** — rich report UI for audit findings (tables, timelines)

---

## 5. Recommended weekly R&D rhythm

| Day | Activity | Skills | Output |
|-----|----------|--------|--------|
| **Mon** | Sync & scope | Read `docs/REVIEW_QUEUE.md`, `parallel-exploring` on touched areas | Updated task list |
| **Tue–Wed** | Build on `cursor/*` | `auto-type-checking`, `grinding-until-pass`, `systematic-debugging` | Feature branch |
| **Wed** | Mid-week QA | §3.2 Pre-release QA or §3.3–3.4 focused review | Pass/fail checklist |
| **Thu** | Audit before PR | §3.1 or `parallel-code-review`, `auditing-security` if API/auth touched | Findings in REVIEW_QUEUE |
| **Thu** | Open PR | `creating-pr`, `screenshotting-changelog` for UI changes | PR link |
| **Fri** | Babysit + handoff | `babysitting-pr`, note for Claude team in REVIEW_QUEUE | Merge-ready or review notes |

**Per merge to `main`:**
- Claude workspace (`/Users/e808m/rivly-claude`) pulls and runs AGENTS.md review checklist
- Run Supabase migrations if schema changed (`003`–`005` etc.)
- Append one line to `docs/REVIEW_QUEUE.md`

**Monthly:** `architecture-decision-records` for Phase 4 (Stripe), Resend, analytics; `seo-auditing` before any public launch.

---

## 6. Skills that need setup

| Skill | Setup required |
|-------|----------------|
| `generating-images` | Copy `~/.cursor/skills/generating-images/.env.example` → `.env`, set `OPENAI_API_KEY`, `pip install openai` |
| Browser QA family | **cursor-ide-browser** MCP (already available here) |
| `switching-projects` | **cursor-app-control** MCP — switch between `/Users/e808m/myfr.ai` and `/Users/e808m/rivly-claude` |
| `adding-analytics` / `adding-error-tracking` | PostHog / Sentry accounts + env vars (not configured yet) |
| `adding-stripe` | Stripe Connect per `docs/STRIPE_CONNECT.md` (Phase 4) |
| `api-smoke-testing` | Dev server running; `.env.local` for Supabase optional (demo mode OK) |
| `adding-e2e-tests` | Playwright install + CI wiring (not set up yet) |

**No setup needed:** most review/audit skills, `parallel-*` workflows, `writing-copy`, `auditing-security`, `grinding-until-pass`.

---

## 7. What NOT to do

### Protected project rules (from `.cursor/rules/rivly.mdc`)

| Do not | Why |
|--------|-----|
| **Edit `lib/classify.ts` prompt** without explicit human review | Core IP — classification logic |
| **Desync 8 categories** across `lib/types.ts`, `schema.sql`, classifier | Breaks dispatch routing |
| **Call Anthropic from the browser** | Use `app/api/classify` only |
| **Auto-verify merchants** | First 50 pros stay manual (`scripts/verify-merchant.sql`) |
| **Commit `.env` / API keys** | Secrets stay local |
| **Skip i18n** | Add strings to both `en.ts` and `fr.ts` |
| **Weaken CI to pass babysit** | Fix scoped issues only (`babysitting-pr` / `babysit` rules) |
| **Edit `~/.cursor/skills-cursor/`** | Built-in; use `~/.cursor/skills/` or `.cursor/skills/` |
| **Force-push `main`** | Branch protection + dual-team workflow |

### Audit discipline

- **Read-only first** for `parallel-code-review` and security audits — implement P0 fixes in a follow-up prompt
- **Don’t run 8 prompts blindly** — start from `REVIEW_QUEUE.md` open items (migrations, Resend, OAuth wizard review)
- **Don’t substitute Vite patterns** — App Router only (see AGENTS.md)
- **Don’t audit without build** — always `npm run build` before browser QA

---

## Quick reference

```
Full audit      → §3.1  + parallel-code-review
Ship candidate  → §3.2  + grinding-until-pass
Core IP review  → §3.3  (read-only classify)
Pro dashboard   → §3.4  + form-testing
Security        → §3.5  + auditing-security
Perf            → §3.6  + auditing-performance
Copy/i18n       → §3.7  + writing-copy
PR merge        → §3.8  + babysitting-pr
Skill index     → .cursor/SKILLS.md
Handoff         → docs/REVIEW_QUEUE.md
```

---

*Playbook version: 2026-06-12 · 65 personal + 15 built-in skills*
