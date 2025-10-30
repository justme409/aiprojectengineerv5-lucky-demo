#!/usr/bin/env bash
set -euo pipefail

URL=${DATABASE_URL:-"postgres://postgres:password@localhost:5555/projectpro"}

echo "Pinging DB: $URL"
psql "$URL" -c "SELECT now() as db_time;"


