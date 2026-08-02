#!/usr/bin/env bash
set -euo pipefail
cli="${1:-go-duck}"
config="${2:-config/go-duck.yaml}"
gdl="${3:-blueprints/teamflow-foundation.gdl}"
out="${4:-apps/api}"

if ! command -v "$cli" >/dev/null 2>&1; then
  echo "GO-DUCK CLI not found: $cli"
  exit 1
fi

if [ -d "$out/.go-duck" ]; then
  echo "Existing GO-DUCK state found. Use the incremental import command instead of a fresh create."
  echo "Inspect '$cli --help' and '$cli import-gdl --help'."
  exit 2
fi

mkdir -p "$out"
set +e
"$cli" create -o "$out" -c "$config" -g "$gdl"
status=$?
set -e
if [ "$status" -ne 0 ]; then
  echo "Generation failed. GO-DUCK CLI flags can differ by version."
  echo "Run '$cli create --help' and adjust scripts/generate_api.sh if needed."
  exit "$status"
fi

echo "Generation complete. Preserve $out/.go-duck and all needle markers."
