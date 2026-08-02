# TeamFlow AI Layer Documentation – Complete Summary

Index for the AI layer specs in this folder. Source specs live alongside architecture and ADR markdown under `docs/`.

## What's in this folder

Three documentation files:

### 1. [01-ai-architecture-overview.md](./01-ai-architecture-overview.md) (~13 KB)

Core concepts and system design:

- Executive summary: AI enhances capture/structuring without bypassing approval gates
- Design principles: evidence-driven, human-approved, immutable audit trail
- Core architecture: voice-to-requirement pipeline
- Data model additions: Recording, Transcript, AIExtraction, ChangeImpact
- Agent roles: eight agents (Transcription, Requirement Extraction, Ambiguity Detector, UX Gap-Filler, Change Impact, Task Breakdown, Test Case Generator, Standup Digest)
- Human review surfaces, confidence thresholds, security & governance, non-goals

### 2. [02-agent-specifications.md](./02-agent-specifications.md) (~25 KB)

Detailed agent implementation specs: inputs/outputs, success criteria, failure modes, orchestration, monitoring, and future enhancements.

### 3. [03-automation-surfaces.md](./03-automation-surfaces.md) (~37 KB)

Role-based UI/UX for BA, PM, Developer, QA, and CTO/Management — plus notifications, feedback loop, audit trail, and configuration.

## Documentation stats

| File | Topics |
|---|---|
| 01-ai-architecture-overview.md | Core design, data model, agent roles, review surfaces, security |
| 02-agent-specifications.md | 8 agent specs, orchestration, monitoring |
| 03-automation-surfaces.md | Role-based surfaces, mockups, feedback, audit, config |

## Key design decisions

1. **Humans always approve** — AI outputs are `PROPOSED`; workflow transitions require human action
2. **Immutable audit trail** — every AI call logged with confidence, model, tokens, outcome
3. **Narrow agents** — single-purpose LLM calls, not a mega-agent
4. **Confidence-based routing** — low-confidence extractions go to a human re-work queue
5. **Role-specific surfaces** — each role sees automation relevant to their job
6. **Cost transparency** — every call tracked for ROI and budget control
7. **Feedback loop** — human modifications inform future model improvements

## File locations

```
docs/ai-layer/
├── README.md                         ← this summary
├── 01-ai-architecture-overview.md
├── 02-agent-specifications.md
└── 03-automation-surfaces.md
```

These are now linked in the docs site under **AI Layer** (sidebar + top subnav). HTML pages in `docs/html/ai-*.html` load these markdown files at runtime.

## Next steps (docs site integration)

1. Add an "AI Layer" group to the docs sidebar / header subnav when HTML pages exist
2. Convert these markdown files to HTML (or render markdown in the docs site)
3. Index content for site search
4. Keep this folder as the canonical source until Product-Docs / HTML sync is decided

## Stakeholder takeaways

**BAs** — AI extracts requirements from recordings; you review/approve; ambiguities are flagged; actions are audited.

**PMs** — Change impact, sprint burndown, and risk/CR queues are AI-assisted; re-analysis is available.

**Developers** — Tasks and estimates are suggested; standup digests surface blockers; estimate edits feed learning.

**QAs** — GHERKIN suites are proposed; you accept/modify; testability flags and coverage tracking included.

**CTOs** — Portfolio health, agent accuracy/cost/ROI, rework and velocity trends.

## Ready for

1. Technical review
2. Architectural presentation to stakeholders
3. Integration with the product-docs site navigation
4. Implementation planning
5. Stakeholder feedback sessions
