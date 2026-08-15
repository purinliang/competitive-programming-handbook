#!/usr/bin/env bash
set -euo pipefail

TEST_STATE_DIR=$(mktemp -d)
TEST_LOG="$TEST_STATE_DIR/wrangler.log"
SERVER_PID=""

cleanup() {
    if [[ -n "$SERVER_PID" ]]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    rm -rf "$TEST_STATE_DIR"
}
trap cleanup EXIT

pnpm build
pnpm exec wrangler d1 migrations apply handbook-learning \
    --local --persist-to "$TEST_STATE_DIR"
pnpm exec wrangler d1 execute handbook-learning \
    --file scripts/fixtures/collaboration-test-seed.sql \
    --local --persist-to "$TEST_STATE_DIR"

pnpm exec wrangler dev \
    --persist-to "$TEST_STATE_DIR" \
    --port 8790 \
    --var BETTER_AUTH_SECRET:test-secret-for-local-only-1234567890 \
    --var GITHUB_CLIENT_ID:test-client \
    --var GITHUB_CLIENT_SECRET:test-client-secret \
    >"$TEST_LOG" 2>&1 &
SERVER_PID=$!

for _ in {1..30}; do
    if curl --fail --silent http://127.0.0.1:8790/api/health >/dev/null; then
        node scripts/test-collaboration-api.mjs
        exit 0
    fi
    sleep 1
done

cat "$TEST_LOG"
exit 1
