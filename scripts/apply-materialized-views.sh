#!/usr/bin/env bash
set -euo pipefail

SQL_FILE="apps/frontend/prisma/migrations/20251103_add_materialized_views.sql"

print_help() {
  cat <<EOF
Usage: ./scripts/apply-materialized-views.sh [--docker-container <name>] [--db-url <DATABASE_URL>]

This script applies the materialized-views SQL to your database. It supports two modes:
  1) If --db-url is provided (or DATABASE_URL env var), it runs psql locally against that URL.
  2) Otherwise it will try to exec into the docker container (default name: godlevel-db) and run psql there.

Examples:
  # using local psql and DATABASE_URL
  DATABASE_URL="postgresql://challenge:challenge_2024@localhost:5432/challenge_db" ./scripts/apply-materialized-views.sh

  # exec into docker container
  ./scripts/apply-materialized-views.sh --docker-container godlevel-db
EOF
}

DOCKER_CONTAINER="godlevel-db"
DB_URL="${DATABASE_URL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker-container) DOCKER_CONTAINER="$2"; shift 2 ;;
    --db-url) DB_URL="$2"; shift 2 ;;
    -h|--help) print_help; exit 0 ;;
    *) echo "Unknown arg: $1"; print_help; exit 1 ;;
  esac
done

if [[ -n "$DB_URL" ]]; then
  echo "Applying materialized views using psql via DATABASE_URL..."
  if ! command -v psql >/dev/null 2>&1; then
    echo "psql not found in PATH. Install PostgreSQL client or use --docker-container." >&2
    exit 2
  fi
  psql "$DB_URL" -f "$SQL_FILE"
  echo "Done."
  exit 0
fi

# Fallback: try docker exec into container
if docker ps --format '{{.Names}}' | grep -qw "$DOCKER_CONTAINER"; then
  echo "Found container $DOCKER_CONTAINER. Executing SQL inside container..."
  docker cp "$SQL_FILE" "$DOCKER_CONTAINER":/tmp/mv.sql
  docker exec -it "$DOCKER_CONTAINER" psql -U challenge -d challenge_db -f /tmp/mv.sql
  echo "Done."
  exit 0
else
  echo "Docker container '$DOCKER_CONTAINER' not running and no DATABASE_URL provided." >&2
  echo "Start the database container (docker compose up -d postgres) or provide --db-url." >&2
  exit 3
fi
