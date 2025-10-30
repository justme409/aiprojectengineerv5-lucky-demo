#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Starting Postgres (docker compose) ..."
docker compose -f docker-compose.yml up -d db

echo "Postgres container requested. Checking health in a few seconds ..."
sleep 3

echo "Tip: default connection url => postgres://postgres:password@localhost:5555/projectpro"
echo "Done."


