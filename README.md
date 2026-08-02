# TeamFlow

TeamFlow is a requirement-governance, delivery-planning and QA-traceability platform. It creates a trustworthy path from business requirement through approval, implementation, testing and release.

## Core Rule

> Approved requirement versions are immutable. Every post-approval modification requires a change request and a new version.

## Repository Status

This repository currently contains:

- Complete TeamFlow product documentation
- Published static documentation site
- Roadmap visualiser schema and delivery dataset
- Initial architecture documentation and ADRs
- GO-DUCK configuration, foundation GDL blueprint, and generation scripts
- PostgreSQL and Keycloak local setup plans
- Environment template and Make targets for engineering bootstrap

The first backend milestone is Vertical Slice 1:

`Project → Requirement Draft → Review → Approval → Immutable Version 1.0 → Audit History`

The Angular web application remains a later implementation phase.

## Important (GO-DUCK)

The generated Go backend depends on your installed GO-DUCK version. Preserve `.go-duck/` generator state and all needle markers. Do not regenerate over custom business logic without inspecting the diff.

## Quick start

```bash
cp .env.example .env
make doctor
make db-up
make validate-gdl
make generate-api
```

Then:

```bash
cd apps/api
go mod tidy
go test ./...
go build ./...
```

## Documentation and roadmap

```bash
make help
make validate-roadmap
make sync-roadmap
make docs-serve
```

Optional schedule enrichment (writes only the canonical JSON):

```bash
make enrich-roadmap
```

Canonical roadmap source of truth:

- `packages/roadmap-data/roadmap.json`
- `packages/roadmap-data/roadmap.schema.ts`
- `roadmap-visualiser-spec.md`

The documentation site loads a synced copy at `docs/data/roadmap.json` via `make sync-roadmap`. Do not edit the docs copy by hand.

Product documents live under `Product-Docs/` and are also mirrored under `docs/product/`. The published static site is under `docs/`.

## Repository structure

```text
apps/api/                 GO-DUCK-generated Go backend
apps/web/                 Angular app (future milestone)
apps/documentation/       Documentation and roadmap application
blueprints/               GDL source of truth
config/                   GO-DUCK config
packages/contracts/       OpenAPI and generated contracts
packages/roadmap-data/    Roadmap schema and data
Product-Docs/             Source product documents
database/                 Migrations and seed data
infrastructure/local/     Local PostgreSQL setup
infrastructure/keycloak/  Keycloak setup plan
docs/                     Static documentation site, architecture, ADRs
scripts/                  Setup, generation, verification and demo automation
```

## First Engineering Milestone

Vertical Slice 1 must support login, project creation, requirement drafting, submission, review, approval, immutable Version 1.0, version history and audit history.

## Source references

- GO-DUCK documentation: https://goduck.theheavenscode.com/
- TeamFlow documentation: https://teamflow-documentation.vercel.app/
