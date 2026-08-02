#!/usr/bin/env bash
set -euo pipefail
action="${1:-}"
case "$action" in
  up)
    if command -v docker >/dev/null 2>&1; then
      docker compose -f infrastructure/local/compose.yaml up -d
    else
      echo "Docker Compose is not available. Start PostgreSQL using Apple containers or a local installation."
      exit 1
    fi
    ;;
  down)
    docker compose -f infrastructure/local/compose.yaml down
    ;;
  *) echo "Usage: $0 {up|down}"; exit 2 ;;
esac
