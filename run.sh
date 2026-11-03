#!/usr/bin/env bash
# Run the whole A.Q.U.A. platform (web client + API) with one command.
#   ./run.sh          build and start in Docker (default)
#   ./run.sh local    run directly with a local Python virtualenv
#   ./run.sh stop     stop the Docker stack
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example - add your HACKCLUB_SEARCH_API_KEY to enable image search."
fi
set -a; . ./.env; set +a
PORT="${AQUA_PORT:-8000}"

case "${1:-docker}" in
  docker)
    docker compose up --build -d
    echo "A.Q.U.A. is running at http://localhost:${PORT}"
    ;;
  local)
    [ -d .venv ] || python3 -m venv .venv
    .venv/bin/pip install -q -r backend/requirements.txt
    echo "A.Q.U.A. is running at http://localhost:${PORT}"
    exec .venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port "$PORT"
    ;;
  stop)
    docker compose down
    ;;
  *)
    echo "Usage: $0 [docker|local|stop]" >&2
    exit 1
    ;;
esac
