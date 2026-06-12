#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Starting myfr.ai dev server on http://localhost:3000"
echo "Keep this terminal open — ERR_CONNECTION_REFUSED means the server stopped."
echo ""
echo "Clearing .next cache (avoids stale webpack chunk errors)..."
rm -rf .next

npm run dev
