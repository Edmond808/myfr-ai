# Dual-team workflow

Rivly uses two local workspaces so Cursor and Claude can work in parallel and review each other's code.

## Workspaces

| Path | Tool | Purpose |
|------|------|---------|
| `/Users/e808m/myfr.ai` | Cursor | Primary development |
| `/Users/e808m/rivly-claude` | Claude Code | Review + parallel features |

Both point at the same git repository.

## Setup Claude workspace (one-time)

```bash
git clone /Users/e808m/myfr.ai /Users/e808m/rivly-claude
cd /Users/e808m/rivly-claude
npm install
```

Or run: `./scripts/setup-claude-workspace.sh`

## Daily loop

```
Cursor builds on cursor/feature-x
        ↓
  push / merge to main
        ↓
Claude pulls in rivly-claude, reviews, opens claude/fix-y
        ↓
  push / merge to main
        ↓
Cursor reviews claude/fix-y in myfr.ai
```

## Sync between workspaces

```bash
# In rivly-claude (Claude workspace)
git fetch origin && git pull origin main

# In myfr.ai (Cursor workspace)
git fetch origin && git pull origin main
```

## Review protocol

1. Check `docs/REVIEW_QUEUE.md` for pending items
2. Check out the branch to review
3. Run `npm run build` and manually test the request flow
4. Add findings to `docs/REVIEW_QUEUE.md`
5. Fix on a new branch if needed, or approve for merge

## Environment

Both workspaces share the same optional `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Demo mode works without it.
