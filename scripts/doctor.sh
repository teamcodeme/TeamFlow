#!/usr/bin/env bash
set -euo pipefail
fail=0
for cmd in go git python3; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "✓ $cmd: $(command -v "$cmd")"
  else
    echo "✗ missing: $cmd"
    fail=1
  fi
done
if command -v go-duck >/dev/null 2>&1; then
  echo "✓ go-duck: $(command -v go-duck)"
else
  echo "✗ missing: go-duck (install using the official GO-DUCK instructions)"
  fail=1
fi
if command -v docker >/dev/null 2>&1; then
  echo "✓ docker available for optional local PostgreSQL"
elif command -v container >/dev/null 2>&1; then
  echo "✓ Apple container CLI detected; adapt infrastructure/local as needed"
else
  echo "! no Docker/Apple container CLI detected; use an existing PostgreSQL instance"
fi
exit "$fail"
