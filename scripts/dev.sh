#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PORT=3000

echo "Starting myfr.ai dev server on http://localhost:${PORT}"
echo "Always use port ${PORT} — do not open localhost:3001 (stale tabs cause chunk errors)."
echo "Keep this terminal open — ERR_CONNECTION_REFUSED means the server stopped."
echo ""

# Stop leftover Next.js dev servers so only one port is active.
for p in 3000 3001; do
  pids=$(lsof -ti :"$p" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Stopping stale server on port $p (PID: $pids)..."
    kill -9 $pids 2>/dev/null || true
  fi
done

echo "Clearing .next cache (avoids stale webpack chunk errors)..."
rm -rf .next

npm install
exec npm run dev -- -p "$PORT"
