#!/usr/bin/env bash
set -euo pipefail
cli="${1:-go-duck}"
gdl="${2:-blueprints/teamflow-foundation.gdl}"
if ! command -v "$cli" >/dev/null 2>&1; then
  echo "GO-DUCK CLI not found: $cli"
  exit 1
fi
if "$cli" validate --help >/dev/null 2>&1; then
  "$cli" validate "$gdl"
elif "$cli" validate-gdl --help >/dev/null 2>&1; then
  "$cli" validate-gdl "$gdl"
else
  echo "Could not detect the validation subcommand. Run: $cli --help"
  echo "Then update scripts/validate_gdl.sh for your installed GO-DUCK version."
  exit 2
fi
