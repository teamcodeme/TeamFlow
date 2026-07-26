#!/usr/bin/env python3
"""Validate packages/roadmap-data/roadmap.json and optional docs sync copy."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / "packages" / "roadmap-data" / "roadmap.json"
DOCS_COPY = ROOT / "docs" / "data" / "roadmap.json"
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
STATUSES = {"completed", "in-progress", "planned", "blocked", "deferred", "cancelled"}
TYPES = {"phase", "module", "feature", "milestone"}


def assert_iso(value, label: str) -> None:
    if value is None:
        return
    if not isinstance(value, str) or not ISO_DATE.match(value):
        raise AssertionError(f"Invalid {label}: expected YYYY-MM-DD")


def validate(data: dict) -> None:
    assert data.get("schemaVersion") == "1.0"
    phases = {p["id"] for p in data["phases"]}
    nodes = {n["id"] for n in data["nodes"]}
    assert len(phases) == len(data["phases"]), "Duplicate phase IDs"
    assert len(nodes) == len(data["nodes"]), "Duplicate node IDs"
    assert data.get("currentPhaseId") in phases, "currentPhaseId missing"

    for phase in data["phases"]:
        assert phase["status"] in STATUSES
        assert 0 <= phase["progress"] <= 100
        assert_iso(phase.get("startDate"), f"phase {phase['id']} startDate")
        assert_iso(phase.get("endDate"), f"phase {phase['id']} endDate")
        assert all(x in nodes for x in phase["children"])

    for node in data["nodes"]:
        assert node["phaseId"] in phases
        assert node["status"] in STATUSES
        assert node["type"] in TYPES
        assert all(x in nodes for x in node["dependsOn"] + node["children"])
        if node["status"] == "blocked":
            assert node.get("blockerReason")
        if node.get("progress") is not None:
            assert 0 <= node["progress"] <= 100
        assert_iso(node.get("startDate"), f"node {node['id']} startDate")
        assert_iso(node.get("endDate"), f"node {node['id']} endDate")
        assert_iso(node.get("milestoneDate"), f"node {node['id']} milestoneDate")
        if node.get("durationDays") is not None:
            assert isinstance(node["durationDays"], (int, float)) and node["durationDays"] >= 0
        if node.get("startDate") and node.get("endDate"):
            assert node["startDate"] <= node["endDate"], f"{node['id']} start after end"


def main() -> int:
    data = json.loads(CANONICAL.read_text(encoding="utf-8"))
    validate(data)

    if DOCS_COPY.exists():
        docs = json.loads(DOCS_COPY.read_text(encoding="utf-8"))
        if docs != data:
            print(
                "docs/data/roadmap.json is out of sync with packages/roadmap-data/roadmap.json.\n"
                "Run `make sync-roadmap`.",
                file=sys.stderr,
            )
            return 1
    else:
        print("Note: docs/data/roadmap.json missing — run `make sync-roadmap` before docs-serve/deploy.")

    print(f"Valid roadmap: {len(data['phases'])} phases, {len(data['nodes'])} nodes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
