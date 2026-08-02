#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="${TEAMFLOW_DB_CONTAINER:-teamflow-postgres}"
DATA_DIR="${TEAMFLOW_DB_DATA_DIR:-$HOME/.teamflow/postgres-data}"

if ! command -v container >/dev/null 2>&1; then
    echo "Apple container CLI is not installed."
    exit 1
fi

read -r -p "Delete TeamFlow PostgreSQL and all local data? [y/N] " answer

case "$answer" in
    y|Y|yes|YES) ;;
    *)
        echo "Cancelled."
        exit 0
        ;;
esac

container stop "$CONTAINER_NAME" >/dev/null 2>&1 || true

if container delete --help >/dev/null 2>&1; then
    container delete "$CONTAINER_NAME" >/dev/null 2>&1 || true
elif container rm --help >/dev/null 2>&1; then
    container rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

rm -rf "$DATA_DIR"

echo "TeamFlow PostgreSQL container and local data removed."
