#!/usr/bin/env bash
set -euo pipefail

TEST_STATE_DIR=$(mktemp -d)
TEST_LOG="$TEST_STATE_DIR/wrangler.log"
TEST_PORT="${COLLABORATION_TEST_PORT:-$((20000 + RANDOM % 20000))}"
TEST_URL="http://127.0.0.1:$TEST_PORT"
SERVER_PID=""

cleanup() {
    if [[ -n "$SERVER_PID" ]]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    rm -rf "$TEST_STATE_DIR"
}
trap cleanup EXIT

pnpm test:content-identity
pnpm build
CI=1 pnpm exec wrangler d1 migrations apply handbook-learning \
    --local --persist-to "$TEST_STATE_DIR"
pnpm exec wrangler d1 execute handbook-learning \
    --file scripts/fixtures/collaboration-test-seed.sql \
    --local --persist-to "$TEST_STATE_DIR"

pnpm exec wrangler dev \
    --persist-to "$TEST_STATE_DIR" \
    --port "$TEST_PORT" \
    --var BETTER_AUTH_SECRET:test-secret-for-local-only-1234567890 \
    --var GITHUB_CLIENT_ID:test-client \
    --var GITHUB_CLIENT_SECRET:test-client-secret \
    >"$TEST_LOG" 2>&1 &
SERVER_PID=$!

for _ in {1..30}; do
    if curl --fail --silent "$TEST_URL/api/health" >/dev/null; then
        if ! COLLABORATION_TEST_URL="$TEST_URL" \
            node scripts/test-collaboration-api.mjs; then
            cat "$TEST_LOG"
            exit 1
        fi
        pnpm exec wrangler d1 execute handbook-learning \
            --file scripts/fixtures/collaboration-test-state.sql \
            --json --local --persist-to "$TEST_STATE_DIR" \
            >"$TEST_STATE_DIR/database-state.json"
        node scripts/test-collaboration-database.mjs \
            "$TEST_STATE_DIR/database-state.json"
        exit 0
    fi
    sleep 1
done

cat "$TEST_LOG"
exit 1
