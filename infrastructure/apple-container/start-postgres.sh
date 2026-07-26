#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="${TEAMFLOW_DB_CONTAINER:-teamflow-postgres}"
IMAGE="${TEAMFLOW_DB_IMAGE:-docker.io/library/postgres:16-alpine}"
DB_PORT="${TEAMFLOW_DB_PORT:-5432}"
DB_USER="${TEAMFLOW_DB_USER:-teamflow}"
DB_PASSWORD="${TEAMFLOW_DB_PASSWORD:-teamflow_dev_password}"
DB_NAME="${TEAMFLOW_DB_NAME:-teamflow}"
DATA_DIR="${TEAMFLOW_DB_DATA_DIR:-$HOME/.teamflow/postgres-data}"

if ! command -v container >/dev/null 2>&1; then
    echo "Apple container CLI is not installed."
    exit 1
fi

container system start >/dev/null 2>&1 || true
mkdir -p "$DATA_DIR"

if container list --all | grep -q "$CONTAINER_NAME"; then
    echo "Existing container found: $CONTAINER_NAME"

    if container list | grep -q "$CONTAINER_NAME"; then
        echo "PostgreSQL is already running."
        exit 0
    fi

    container start "$CONTAINER_NAME"
    echo "PostgreSQL started."
    exit 0
fi

echo "Starting TeamFlow PostgreSQL with Apple Container..."

container run \
    --detach \
    --name "$CONTAINER_NAME" \
    --publish "127.0.0.1:${DB_PORT}:5432" \
    --env "POSTGRES_USER=${DB_USER}" \
    --env "POSTGRES_PASSWORD=${DB_PASSWORD}" \
    --env "POSTGRES_DB=${DB_NAME}" \
    --volume "${DATA_DIR}:/var/lib/postgresql/data" \
    --memory 2g \
    --cpus 2 \
    "$IMAGE"

echo "Waiting for PostgreSQL..."

for attempt in $(seq 1 30); do
    if container exec "$CONTAINER_NAME" \
        pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        echo "PostgreSQL is ready at 127.0.0.1:${DB_PORT}"
        exit 0
    fi
    sleep 2
done

echo "PostgreSQL failed to become ready."
container logs "$CONTAINER_NAME" || true
exit 1
