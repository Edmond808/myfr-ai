#!/usr/bin/env bash
set -euo pipefail

CURSOR_WS="/Users/e808m/myfr.ai"
CLAUDE_WS="/Users/e808m/rivly-claude"

if [ -d "$CLAUDE_WS/.git" ]; then
  echo "Claude workspace already exists at $CLAUDE_WS"
  cd "$CLAUDE_WS"
  git fetch origin
  git pull origin main || true
else
  echo "Cloning Rivly repo to $CLAUDE_WS..."
  git clone "$CURSOR_WS" "$CLAUDE_WS"
  cd "$CLAUDE_WS"
fi

npm install
echo ""
echo "Claude workspace ready at: $CLAUDE_WS"
echo "Open it in Claude Code and read CLAUDE.md"
