#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="${TEAMFLOW_DB_CONTAINER:-teamflow-postgres}"

if ! command -v container >/dev/null 2>&1; then
    echo "Apple container CLI is not installed."
    exit 1
fi

container logs "$CONTAINER_NAME"
