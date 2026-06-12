# Cursor Skills Index — myfr.ai

Installed from [awesome-cursor-skills](https://github.com/spencerpauly/awesome-cursor-skills) on 2026-06-12.

## Where skills live

| Location | Scope | Count |
|----------|-------|-------|
| `~/.cursor/skills/` | Personal — available in all projects | **65** (installed from awesome-cursor-skills) |
| `~/.cursor/skills-cursor/` | Built-in Cursor skills (do not edit) | 15 |
| `.cursor/skills/` | Project-level (not used yet) | 0 |

**Path pattern:** `~/.cursor/skills/<skill-name>/SKILL.md`

---

## Installed skills (`~/.cursor/skills/`)

### Cursor-native workflows

| Skill | Description |
|-------|-------------|
| `accessibility-auditing` | Audit pages via browser aria snapshots for labels, tab order, contrast, and ARIA issues. |
| `auto-type-checking` | Run `tsc --noEmit` after edits; supports Cursor hooks for automatic enforcement. |
| `best-of-n-solving` | Try multiple approaches in parallel using isolated git worktrees, then pick the best. |
| `building-skills-from-patterns` | Turn repeated multi-step workflows into a new `SKILL.md` under `.cursor/skills/`. |
| `codebase-onboarding` | Parallel explore subagents → synthesized onboarding doc for architecture, auth, APIs, etc. |
| `comparing-branches-visually` | Run two branches on different ports, screenshot same pages, produce visual diff for PRs. |
| `dark-mode-testing` | Toggle light/dark in browser, screenshot both, flag missing tokens or contrast issues. |
| `detecting-port-conflicts` | Detect `EADDRINUSE`, find the blocking process, kill or suggest alternate port. |
| `finding-dev-server-url` | Scan terminals for dev server URLs and open the app in Cursor's browser. |
| `form-testing` | Fill/submit forms with valid/invalid data; verify validation, errors, and success flows. |
| `grinding-until-pass` | Autonomous fix → run → check loop until tests, build, or lint pass. |
| `monitoring-terminal-errors` | Watch running processes for crashes; navigate to failing file and fix automatically. |
| `network-request-auditing` | Audit fetch/XHR after browser interactions for failures, slowness, duplicates, risky payloads. |
| `parallel-ci-triage` | Assign each failing CI job to a parallel subagent, fix independently, re-run CI. |
| `parallel-code-review` | Four parallel read-only reviews (security, performance, correctness, readability). |
| `parallel-exploring` | Launch multiple explore subagents to investigate different codebase areas simultaneously. |
| `parallel-test-fixing` | Assign each failing test file to a separate subagent for parallel fixes. |
| `profiling-performance` | Profile CPU in Cursor's browser profiler; capture call stacks and slow functions. |
| `recording-browser-flow-as-test` | Walk a flow in browser, log steps, emit a Playwright spec from the accessibility tree. |
| `responsive-testing` | Screenshot at mobile/tablet/desktop viewports; report layout breakage. |
| `saving-workspace-context` | Persist research, decisions, and learnings to workspace files across conversations. |
| `screenshotting-changelog` | Before/after screenshots for visual PR descriptions and changelogs. |
| `suggesting-cursor-hooks` | Suggest a `.cursor/hooks.json` hook when the same check is requested repeatedly. |
| `suggesting-cursor-rules` | Suggest a `.cursor/rules/` file when the same convention correction repeats. |
| `suggesting-skills` | Suggest installing a known skill when the user struggles with a matching task. |
| `switching-projects` | Switch workspace via `cursor-app-control` MCP without opening a new window. |
| `tailing-build-output` | Monitor streaming build output; summarize and fix warnings/errors before finish. |
| `verifying-in-browser` | Start dev server, open app side-by-side, verify rendering, console, and network. |
| `visual-qa-testing` | Launch app in browser, screenshot, check console errors, audit network requests. |

### Analytics & tracking

| Skill | Description |
|-------|-------------|
| `adding-analytics` | Add PostHog event tracking, page views, feature flags, and session replay. |
| `adding-feature-flags` | Feature flags for rollouts and A/B testing (PostHog, LaunchDarkly, or local). |

### Error tracking

| Skill | Description |
|-------|-------------|
| `adding-error-tracking` | Add Sentry crash reporting, performance monitoring, and source maps. |

### Authentication & payments

| Skill | Description |
|-------|-------------|
| `adding-auth` | OAuth login, session management, protected routes with Auth.js (NextAuth). |
| `adding-stripe` | Stripe checkout, subscriptions, webhooks, and customer portal. |

### Testing

| Skill | Description |
|-------|-------------|
| `adding-e2e-tests` | Set up Playwright with config, example tests, page objects, and CI integration. |
| `api-smoke-testing` | Discover API routes, hit every endpoint, report errors. |
| `python-tdd-with-uv` | Python TDD with uv — red-green-refactor, vertical slicing. |
| `writing-tests` | Analyze code and write unit/integration tests with mocking and edge cases. |

### Workflow

| Skill | Description |
|-------|-------------|
| `babysitting-pr` | Monitor open PR for CI failures, review comments, merge conflicts; keep merge-ready. |
| `creating-pr` | Create clean, review-ready PRs with conventional titles and structured descriptions. |
| `incident-response` | Triage production incidents, mitigate, communicate, write blameless postmortems. |
| `systematic-debugging` | Reproduce, isolate, hypothesize, verify — git bisect, binary search, logging. |
| `writing-commit-messages` | Conventional commit messages with type prefixes, scopes, and meaningful bodies. |

### Infrastructure & DevOps

| Skill | Description |
|-------|-------------|
| `adding-docker` | Multi-stage Dockerfile, docker-compose, and `.dockerignore`. |
| `kubernetes-deploying` | Deploy to Kubernetes — Deployments, Services, Ingress, health checks, autoscaling. |
| `setting-up-ci` | GitHub Actions CI/CD with lint, test, type-check, and deploy steps. |
| `setting-up-terraform` | Terraform IaC — provider config, modules, remote state, CI integration. |

### Code quality & security

| Skill | Description |
|-------|-------------|
| `auditing-performance` | Audit bundle size, rendering, DB queries, and Core Web Vitals. |
| `auditing-security` | OWASP Top 10, secrets exposure, insecure patterns. |
| `fixing-broken-links` | Crawl URLs, test HTTP responses, fix or replace broken links. |
| `reviewing-code` | Thorough review for correctness, maintainability, performance, best practices. |
| `verifying-markdown-formatting` | Verify headings, lists, links, code blocks, spacing in Markdown files. |

### Dependencies

| Skill | Description |
|-------|-------------|
| `updating-npm-package` | Safely update npm packages — release notes, minor auto-apply, major migration guides. |

### Frontend & UI

| Skill | Description |
|-------|-------------|
| `converting-css-modules-to-tailwind` | Migrate CSS Modules to Tailwind — `styles.xxx`, `composes`, conditional classNames. |
| `converting-css-to-tailwind` | Convert plain CSS to Tailwind utilities — selectors, media queries, animations. |
| `react-native-patterns` | React Native + Expo — navigation, platform code, performance, native modules. |
| `using-ui-stack` | Enforce design system (8px grid, tokens, typography, dark mode, 5-state interactions). |

### Planning & architecture

| Skill | Description |
|-------|-------------|
| `architecture-decision-records` | Document technical decisions as ADRs with context, options, and rationale. |
| `database-design` | Schema design — tables, relationships, indexes, constraints, ORM setup. |

### Documentation

| Skill | Description |
|-------|-------------|
| `adding-api-docs` | OpenAPI/Swagger docs with interactive docs UI. |

### Utilities

| Skill | Description |
|-------|-------------|
| `exporting-to-png` | Export code, diagrams, terminal output, or UI to PNG via headless browser/CLI. |
| `generating-images` | Generate/edit images via OpenAI `gpt-image-2` (icons, logos, OG images, mockups). |
| `prompt-engineering` | Effective LLM prompts — system prompts, few-shot, chain-of-thought, structured output. |
| `seo-auditing` | Technical SEO — meta tags, structured data, Open Graph, sitemaps, Core Web Vitals. |
| `writing-copy` | Marketing copy for landing pages, CTAs, emails, microcopy, product descriptions. |

---

## Built-in Cursor skills (`~/.cursor/skills-cursor/`)

These ship with Cursor and were **not** duplicated. They complement the installed set:

| Built-in | Related installed skill |
|----------|-------------------------|
| `babysit` | `babysitting-pr` (similar goal; different workflow detail) |
| `create-hook` | `suggesting-cursor-hooks` (suggest vs. author) |
| `create-rule` | `suggesting-cursor-rules` (suggest vs. author) |
| `create-skill` | `suggesting-skills`, `building-skills-from-patterns` |
| `split-to-prs` | `creating-pr` (split vs. create) |
| `automate`, `canvas`, `loop`, `sdk`, `shell`, `statusline`, `update-cursor-settings`, `update-cli-config`, `create-subagent`, `migrate-to-skills` | No direct overlap |

---

## Skipped (not in the repo)

The awesome-cursor-skills README also links to **external** skills and marketplace plugins that are **not** bundled in the repo. These were not installed automatically:

- PostHog skills (`posthog-llm-analytics`, `posthog-migrations`)
- Sentry skills (`code-simplifier`, `find-bugs`, `code-review`, etc.)
- Vercel agent skills (`react-best-practices`, `web-design-guidelines`, etc.)
- Anthropic skills (`frontend-design`, `webapp-testing`, `docx`, `pdf`, etc.)
- mattpocock skills (`tdd`, `prd-to-issues`, `grill-me`, etc.)
- Other third-party: `shadcn-ui`, `seo-analysis`, `concise`, `antonbabenko-terraform`, `chatcrystal`

Install those separately from their linked repos or via **Cursor Settings → Plugins** for marketplace plugins.

**No skills were skipped for identical content** — none of the 65 repo skills matched a built-in `skills-cursor` file byte-for-byte.

---

## Manual setup

### `generating-images`

Requires OpenAI API access:

```bash
cp ~/.cursor/skills/generating-images/.env.example ~/.cursor/skills/generating-images/.env
# Edit .env — set OPENAI_API_KEY
pip install --upgrade openai
```

### Browser-dependent skills

Skills like `visual-qa-testing`, `verifying-in-browser`, and `form-testing` need the **cursor-ide-browser** MCP enabled (already available in this Cursor setup).

### `switching-projects`

Requires the **cursor-app-control** MCP (`move_agent_to_root` tool).

---

## myfr.ai-relevant picks

For this Next.js + Supabase marketplace prototype, these skills are especially useful:

- **Dev flow:** `visual-qa-testing`, `verifying-in-browser`, `grinding-until-pass`, `auto-type-checking`
- **Quality:** `reviewing-code`, `auditing-security`, `accessibility-auditing`, `responsive-testing`
- **Product:** `writing-copy`, `seo-auditing`, `using-ui-stack`
- **Integrations:** `adding-auth`, `adding-stripe`, `adding-analytics`, `adding-error-tracking`
- **Team workflow:** `creating-pr`, `babysitting-pr`, `writing-commit-messages`, `architecture-decision-records`

---

## Updating

To refresh from upstream:

```bash
git clone --depth 1 https://github.com/spencerpauly/awesome-cursor-skills.git /tmp/awesome-cursor-skills
cp -R /tmp/awesome-cursor-skills/resources/* ~/.cursor/skills/
```

Then update this index if new skills were added.
