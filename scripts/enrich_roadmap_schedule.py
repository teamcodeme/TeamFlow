#!/usr/bin/env python3
"""
Derive optional planning dates for roadmap nodes from phase order and dependencies.

Idempotent: preserves existing startDate/endDate/milestoneDate/durationDays when set.
Writes only to packages/roadmap-data/roadmap.json (canonical source).
"""
from __future__ import annotations

import json
import re
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / "packages" / "roadmap-data" / "roadmap.json"

PROJECT_START = date(2026, 1, 6)
DEFAULT_DURATION = {
    "feature": 5,
    "module": 8,
    "milestone": 1,
}


def parse_effort_days(effort: str | None, node_type: str) -> int:
    if not effort:
        return DEFAULT_DURATION.get(node_type, 5)
    nums = [int(x) for x in re.findall(r"\d+", effort)]
    if not nums:
        return DEFAULT_DURATION.get(node_type, 5)
    return max(1, max(nums))


def add_days(d: date, days: int) -> date:
    return d + timedelta(days=days)


def iso(d: date) -> str:
    return d.isoformat()


def main() -> None:
    data = json.loads(CANONICAL.read_text(encoding="utf-8"))
    nodes = {n["id"]: n for n in data["nodes"]}
    phases = sorted(data["phases"], key=lambda p: p["order"])

    # Schedule nodes in dependency order within overall phase order.
    end_by_id: dict[str, date] = {}
    start_by_id: dict[str, date] = {}

    # Seed: phase-00 children can start at PROJECT_START
    ready = []
    remaining = set(nodes)

    # Kahn-style: process nodes whose deps are scheduled (or have no deps)
    # Prefer phase order then node order for stable results.
    ordered = sorted(
        data["nodes"],
        key=lambda n: (
            next(p["order"] for p in phases if p["id"] == n["phaseId"]),
            n["order"],
            n["id"],
        ),
    )

    for n in ordered:
        duration = n.get("durationDays")
        if duration is None:
            duration = parse_effort_days(n.get("estimatedEffort"), n["type"])

        if n.get("startDate") and (n.get("endDate") or n.get("milestoneDate")):
            start = date.fromisoformat(n["startDate"])
            if n["type"] == "milestone":
                end = date.fromisoformat(n.get("milestoneDate") or n.get("endDate") or n["startDate"])
            else:
                end = date.fromisoformat(n["endDate"])
            start_by_id[n["id"]] = start
            end_by_id[n["id"]] = end
            continue

        dep_ends = [end_by_id[d] for d in n.get("dependsOn", []) if d in end_by_id]
        if dep_ends:
            start = max(dep_ends) + timedelta(days=1)
        else:
            # Align to phase window if prior phase known
            phase = next(p for p in phases if p["id"] == n["phaseId"])
            prior = [p for p in phases if p["order"] < phase["order"]]
            if prior:
                # start after last scheduled node in prior phase, else PROJECT_START
                prior_ids = [cid for p in prior for cid in p.get("children", [])]
                prior_ends = [end_by_id[i] for i in prior_ids if i in end_by_id]
                start = (max(prior_ends) + timedelta(days=2)) if prior_ends else PROJECT_START
            else:
                start = PROJECT_START

        if n["type"] == "milestone":
            end = start
            n["startDate"] = iso(start)
            n["endDate"] = iso(end)
            n["milestoneDate"] = iso(end)
            n["durationDays"] = 1
        else:
            end = add_days(start, max(0, duration - 1))
            n["startDate"] = iso(start)
            n["endDate"] = iso(end)
            n["durationDays"] = duration
            if "milestoneDate" in n:
                del n["milestoneDate"]

        if not n.get("assignee") and n.get("owner"):
            n["assignee"] = n["owner"]

        start_by_id[n["id"]] = start
        end_by_id[n["id"]] = end

    # Phase spans from children
    for phase in data["phases"]:
        child_starts = [start_by_id[c] for c in phase.get("children", []) if c in start_by_id]
        child_ends = [end_by_id[c] for c in phase.get("children", []) if c in end_by_id]
        if child_starts and child_ends:
            phase["startDate"] = iso(min(child_starts))
            phase["endDate"] = iso(max(child_ends))

    data["updatedAt"] = date.today().isoformat()
    CANONICAL.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        f"Enriched {len(data['nodes'])} nodes and {len(data['phases'])} phases "
        f"({PROJECT_START} … {max(end_by_id.values())})"
    )


if __name__ == "__main__":
    main()
