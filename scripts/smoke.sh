#!/usr/bin/env bash
# Starts the production server (run `npm run build` first), checks every page and the Nivvi API, then stops it.
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

# Nivvi must answer and end with follow-up questions
reply=$(curl -s -X POST "$BASE/api/nivvi" -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"What projects have you worked on?"}]}')
if echo "$reply" | grep -q "NEXT:"; then echo "ok   api /api/nivvi"; else echo "FAIL api /api/nivvi: $reply"; fail=1; fi

[ "$fail" = "0" ] || { echo; echo "Smoke test failed. Server log:"; tail -30 /tmp/smoke-server.log; exit 1; }
echo "Smoke test passed."
