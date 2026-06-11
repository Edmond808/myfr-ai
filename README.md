# Rivly

AI-powered services marketplace prototype for the French Riviera.

Describe what you need in plain language → AI classifies and dispatches to verified local pros → compare quotes → accept and pay via escrow.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Optional: copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY` for live AI dispatch. Without it, demo mode uses keyword-based classification.

## Dual-team setup

| Workspace | Tool |
|-----------|------|
| `/Users/e808m/myfr.ai` | Cursor (build) |
| `/Users/e808m/rivly-claude` | Claude Code (review) |

See [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md) and [AGENTS.md](AGENTS.md).

## Prototype flow

1. **Home** — describe a need, pick a Riviera city, or click a category chip
2. **Dispatch** — AI parses the request, shows job summary + market estimate
3. **Quotes** — simulated merchant quotes arrive over ~5 seconds
4. **Accept** — escrow breakdown with 15% Rivly commission

## Improvements over original JSX

- Server-side Anthropic API (no exposed keys in browser)
- Demo mode fallback when no API key
- TypeScript + component split
- Clickable category chips with example pre-fill
- ⌘+Enter to submit
