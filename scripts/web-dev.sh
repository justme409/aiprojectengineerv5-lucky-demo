#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="${ROOT_DIR}/apps/web"
SUPABASE_DIR="${ROOT_DIR}/supabase"
SUPABASE_DB_CONTAINER="supabase_db_aiprojectengineerv3"
GRAPHRAG_DIR="$(cd "${ROOT_DIR}/.." && pwd)/graphRAG/python-rag-service"
GRAPHRAG_LOG_FILE="${GRAPHRAG_DIR}/web-dev.log"
GRAPHRAG_PID_FILE="${GRAPHRAG_DIR}/web-dev.pid"
GRAPHRAG_PORT=9999

ensure_supabase() {
  if ! docker ps --format '{{.Names}}' | grep -q "^${SUPABASE_DB_CONTAINER}$"; then
    echo "Starting Supabase stack for aiprojectengineerv3 ..."
    (cd "${SUPABASE_DIR}" && supabase start)
  else
    echo "Supabase stack for aiprojectengineerv3 is already running."
  fi
}

wait_for_port() {
  local port=$1
  local name=$2
  for i in {1..30}; do
    if curl -s --max-time 2 "http://localhost:${port}/" >/dev/null 2>&1; then
      echo "${name} is ready."
      return 0
    fi
    sleep 1
  done
  echo "Warning: ${name} did not report healthy within timeout." >&2
  return 1
}

ensure_graphrag() {
  if [ ! -d "${GRAPHRAG_DIR}" ]; then
    echo "Warning: GraphRAG directory not found at ${GRAPHRAG_DIR}. Skipping RAG service startup."
    return
  fi

  if curl -s --max-time 2 "http://localhost:${GRAPHRAG_PORT}/health" >/dev/null 2>&1; then
    echo "GraphRAG Python service already running on port ${GRAPHRAG_PORT}."
    return
  fi

  echo "Starting GraphRAG Python RAG service (port ${GRAPHRAG_PORT}) ..."
  (
    cd "${GRAPHRAG_DIR}"
    if [ -d "venv" ]; then
      # shellcheck disable=SC1091
      source venv/bin/activate
    fi
    nohup python3 main.py >>"${GRAPHRAG_LOG_FILE}" 2>&1 &
    echo $! >"${GRAPHRAG_PID_FILE}"
  )
  wait_for_port "${GRAPHRAG_PORT}" "GraphRAG service"
}

echo "Preparing development environment ..."
ensure_supabase
ensure_graphrag

cd "${WEB_DIR}"

echo "Starting Next.js dev server ..."
pnpm dev -p 3000


