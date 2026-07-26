# TeamFlow Main Product — GO-DUCK Starter

This repository starter prepares the first TeamFlow backend vertical slice:

`Project → Requirement Draft → Review → Approval → Immutable Version 1.0 → Audit History`

## What is included

- GO-DUCK configuration template
- Foundation GDL blueprint
- Environment template
- PostgreSQL local setup
- Keycloak realm/client/role plan
- Architecture and ADR documents
- Generation and verification scripts
- Custom workflow extension specifications
- Complete TeamFlow product documentation

## Important

The generated GO backend is intentionally **not pre-generated** in this package because the GO-DUCK CLI is not installed in this environment and its generated output depends on your installed GO-DUCK version. Run the generator locally and preserve its `.go-duck/` state and needle markers.

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

## Repository structure

```text
apps/api/                 GO-DUCK-generated Go backend
apps/web/                 Angular app (future milestone)
blueprints/               GDL source of truth
config/                   GO-DUCK config
infrastructure/local/     Local PostgreSQL setup
infrastructure/keycloak/  Keycloak setup plan
scripts/                  Generation and verification scripts
docs/product/             Product and technical specifications
docs/architecture/        Initial architecture
docs/adr/                 Architecture decisions
```

## Source references

- GO-DUCK documentation: https://goduck.theheavenscode.com/
- TeamFlow documentation: https://teamflow-documentation.vercel.app/
