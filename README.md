# TeamFlow

TeamFlow is a requirement-governance, delivery-planning and QA-traceability platform. It creates a trustworthy path from business requirement through approval, implementation, testing and release.

## Core Rule

> Approved requirement versions are immutable. Every post-approval modification requires a change request and a new version.

## Repository Status

This repository currently contains:

- Complete TeamFlow product documentation
- Published static documentation site
- Roadmap visualiser schema and delivery dataset
- Initial architecture documentation
- Initial Architecture Decision Records
- Claude Code repository instructions
- Environment and Make targets for the engineering bootstrap

The Angular web application and Go API are the next implementation phase.

## Planned Structure

```text
apps/web              Angular application
apps/api              Go modular-monolith API
apps/documentation    Documentation and roadmap application
packages/contracts    OpenAPI and generated contracts
packages/roadmap-data Roadmap schema and data
database               Migrations and seed data
infrastructure         Containers, proxy and Kubernetes later
scripts                Setup, tests and demo automation
```

## Current Documentation

The source product documents are under `Product-Docs/`. The published static site is under `docs/`.

## Roadmap Files

Canonical source of truth:

- `packages/roadmap-data/roadmap.json`
- `packages/roadmap-data/roadmap.schema.ts`
- `roadmap-visualiser-spec.md`

The documentation site loads a synced copy at `docs/data/roadmap.json` via `make sync-roadmap` / `python3 scripts/sync_roadmap.py` (also the Vercel `buildCommand`). Do not edit the docs copy by hand.

Optional schedule enrichment (writes only the canonical JSON):

```bash
make enrich-roadmap
```

## Initial Commands

```bash
make help
make validate-roadmap
make sync-roadmap
make docs-serve
make doctor
```

After application scaffolding:

```bash
make dev
make test
make build
```

## First Engineering Milestone

Vertical Slice 1 must support login, project creation, requirement drafting, submission, review, approval, immutable Version 1.0, version history and audit history.
