# Rivly — Agent Instructions

Rivly is an AI-powered services marketplace prototype for the French Riviera (Côte d'Azur).

## Project structure

```
src/
  components/   # React UI (RivlyApp, HomeView, DispatchView, Header, Stars)
  lib/          # Client types, constants, classify API client
server/
  classify.ts   # Server-side AI dispatch + demo fallback
```

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Lucide icons
- Anthropic API (server-side only, via `/api/classify`)

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Optional: copy `.env.example` → `.env` and set `ANTHROPIC_API_KEY` for live AI classification. Without it, demo mode uses keyword heuristics.

## Dual-team workflow

Two workspaces share this git repo:

| Team | Workspace | Role |
|------|-----------|------|
| **Cursor** | `/Users/e808m/myfr.ai` | Primary build team |
| **Claude** | `/Users/e808m/rivly-claude` | Review + parallel work |

### Branch convention

- `main` — stable, reviewed code
- `cursor/*` — Cursor team feature branches
- `claude/*` — Claude team review/fix branches

### Handoff protocol

1. **Before starting work**: read `docs/REVIEW_QUEUE.md` for open items
2. **After completing work**: append a line to `docs/REVIEW_QUEUE.md` with branch, summary, and what needs review
3. **Reviewing another team's work**: check out their branch, run `npm run build`, test the flow, leave findings in `docs/REVIEW_QUEUE.md`

### What to preserve

- Brand palette in `src/lib/constants.ts` (navy `#10324A`, azure `#2B86BC`, amber `#E2992F`)
- Fraunces + Inter typography
- Never expose API keys in client code — all AI calls go through `server/classify.ts`

### Review checklist

- [ ] `npm run build` passes
- [ ] Home → dispatch → accept quote flow works
- [ ] Demo mode works without API key
- [ ] No secrets in git
- [ ] Mobile layout acceptable (responsive grid)
