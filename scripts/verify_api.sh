#!/usr/bin/env bash
set -euo pipefail
api="${1:-apps/api}"
if [ ! -f "$api/go.mod" ]; then
  echo "No generated Go module found at $api. Run make generate-api first."
  exit 1
fi
cd "$api"
gofmt -w .
go vet ./...
go test ./...
go build ./...
