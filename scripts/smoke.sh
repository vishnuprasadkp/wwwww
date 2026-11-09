#!/usr/bin/env bash
# Starts the production server (run `npm run build` first), checks every page and the Nyrro API, then stops it.
set -euo pipefail
PORT="${SMOKE_PORT:-3456}"
BASE="http://localhost:$PORT"

npx next start -p "$PORT" >/tmp/smoke-server.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  curl -fs -o /dev/null "$BASE/" && break
  sleep 1
done

fail=0
for path in / /about /resume /work/enterprise-search /work/adeo /work/ai-agent /work/hdfc /work/sony; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  [ "$code" = "200" ] && echo "ok   $code $path" || { echo "FAIL $code $path"; fail=1; }
done

# Static files the pages depend on
for file in /icon.png /resume/Vishnu_Prasad_Resume.pdf /images/site/paper.webp; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$file")
  [ "$code" = "200" ] && echo "ok   $code $file" || { echo "FAIL $code $file"; fail=1; }
done

# Nyrro: the locked v4 bundle is served, and its answers are exactly the approved ones
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/nyrro.bundle.js")
[ "$code" = "200" ] && echo "ok   $code /nyrro.bundle.js" || { echo "FAIL $code /nyrro.bundle.js"; fail=1; }
if node -e 'const t=require("./public/nyrro.bundle.js").selfTest(); process.exit(t.ok && t.fingerprint==="39cde9602569f256" ? 0 : 1)'; then echo "ok   Nyrro.selfTest()"; else echo "FAIL Nyrro.selfTest()"; fail=1; fi

[ "$fail" = "0" ] || { echo; echo "Smoke test failed. Server log:"; tail -30 /tmp/smoke-server.log; exit 1; }
echo "Smoke test passed."
