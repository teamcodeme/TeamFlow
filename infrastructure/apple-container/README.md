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
