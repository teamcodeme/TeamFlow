# TeamFlow Apple Container PostgreSQL Scripts

## Setup

```bash
chmod +x *.sh
container system start
./start-postgres.sh
```

## Commands

```bash
./start-postgres.sh
./stop-postgres.sh
./restart-postgres.sh
./status.sh
./logs.sh
./reset-postgres.sh
```

## Optional environment variables

```bash
export TEAMFLOW_DB_CONTAINER=teamflow-postgres
export TEAMFLOW_DB_IMAGE=docker.io/library/postgres:16-alpine
export TEAMFLOW_DB_PORT=5432
export TEAMFLOW_DB_USER=teamflow
export TEAMFLOW_DB_PASSWORD=teamflow_dev_password
export TEAMFLOW_DB_NAME=teamflow
export TEAMFLOW_DB_DATA_DIR="$HOME/.teamflow/postgres-data"
```

## Notes

Apple Container bind mounts are virtiofs shares. Do not mount the host data
directory directly onto `/var/lib/postgresql/data` — Postgres tries to
`chmod`/`chown` that path and fails with `Operation not permitted`.
These scripts mount onto `/var/lib/postgresql` instead so Postgres can create
its own `data` subdirectory under the share.
