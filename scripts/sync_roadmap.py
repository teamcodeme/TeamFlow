#!/usr/bin/env python3
"""Copy canonical roadmap data into the static docs site."""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / "packages" / "roadmap-data" / "roadmap.json"
DEST = ROOT / "docs" / "data" / "roadmap.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync roadmap.json into docs/data/")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit non-zero if docs/data/roadmap.json is missing or out of sync",
    )
    args = parser.parse_args()

    if not CANONICAL.is_file():
        print(f"Canonical roadmap missing: {CANONICAL}", file=sys.stderr)
        return 1

    canonical_text = CANONICAL.read_text(encoding="utf-8")

    if args.check:
        if not DEST.is_file():
            print(f"Missing {DEST}; run: make sync-roadmap", file=sys.stderr)
            return 1
        if DEST.read_text(encoding="utf-8") != canonical_text:
            print(f"{DEST} is out of sync with {CANONICAL}", file=sys.stderr)
            return 1
        print(f"In sync: {DEST}")
        return 0

    DEST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(CANONICAL, DEST)
    print(f"Synced {DEST.relative_to(ROOT)} ← {CANONICAL.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
