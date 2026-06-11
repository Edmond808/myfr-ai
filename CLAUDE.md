# Rivly — Claude Code Instructions

Read `AGENTS.md` first for project context and dual-team workflow.

## Your role (Claude team)

You work in `/Users/e808m/rivly-claude` — a git clone of the Cursor team's repo. Your job:

1. **Review** Cursor's changes on `cursor/*` branches
2. **Fix** bugs, improve UX, tighten types
3. **Document** findings in `docs/REVIEW_QUEUE.md`

## Quick start

```bash
cd /Users/e808m/rivly-claude
git fetch origin
git checkout main && git pull
npm install
npm run dev
```

## Review a Cursor branch

```bash
git fetch origin
git checkout cursor/feature-name
npm install
npm run build
# Test: submit a grocery request in Cannes, verify quotes arrive
```

Leave review notes in `docs/REVIEW_QUEUE.md` under "Claude reviews".

## When making changes

- Branch from `main`: `git checkout -b claude/your-change`
- Keep diffs focused — one concern per branch
- Run `npm run build` before committing
- Push and note in `docs/REVIEW_QUEUE.md` for Cursor to review

## Key files

- `src/components/RivlyApp.tsx` — main state + flow
- `server/classify.ts` — AI dispatch (never call Anthropic from browser)
- `src/lib/constants.ts` — brand, merchants, categories

## Do not

- Commit `.env` files
- Add client-side API keys
- Rewrite the whole app unless asked
