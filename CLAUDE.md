# TeamFlow Engineering Instructions

## Mission

Implement TeamFlow as a secure requirement-governance and delivery-assurance platform. The core invariant is: **an approved requirement version can never be silently modified**.

## Product rule

Approved requirement versions are immutable. Any post-approval change must use a formal new version and, in later milestones, a change request.

## Read Before Coding

1. `Product-Docs/03-mvp-scope.md` (also mirrored under `docs/product/`)
2. `Product-Docs/05-requirement-workflow.md`
3. `Product-Docs/06-change-request-workflow.md`
4. `Product-Docs/09-data-model.md`
5. `Product-Docs/10-api-contract.md`
6. `Product-Docs/11-security-model.md`
7. `docs/architecture/*`
8. `docs/adr/*`

## Current scope

Implement only the first backend vertical slice:

1. Project and project membership
2. Requirement draft
3. Acceptance criteria
4. Submission
5. Review decisions
6. Final approval
7. Immutable Version 1.0
8. Version history
9. Audit history

Do not implement Angular, change requests, sprint planning, QA, defects, releases, dashboards, messaging, AI, microservices, or Kubernetes yet. Do not start those features before Vertical Slice 1 passes.

## Target Architecture

- Monorepo
- Angular standalone web client (later milestone)
- Go modular-monolith API
- PostgreSQL
- REST/OpenAPI
- Keycloak OIDC authentication
- OCI-compatible local dependencies

## Generator rules

- Preserve `.go-duck/` generator state.
- Preserve all GO-DUCK needle comments.
- Extend generated code through supported extension points.
- Do not regenerate over custom business logic without inspecting the diff.
- Treat GDL as the schema source of truth.

## Mandatory Rules

- Never update an approved RequirementVersion in place.
- Every post-approval change requires a ChangeRequest and new draft version.
- Tasks and test cases reference exact requirement versions.
- Enforce authorization in the API; frontend visibility is not authorization.
- Apply project scope to every project-owned query.
- Project-scoped authorization in addition to realm roles.
- Workflow transitions belong in application/domain services, not controllers.
- Critical state transition and audit insertion must share a transaction.
- Approval, current-version update, approval record, and audit record must be one transaction.
- Do not expose unrestricted update/delete CRUD for RequirementVersion, RequirementApproval, or AuditLog.
- Audit records are append-only.
- Use optimistic locking for editable records.
- Store timestamps in UTC.
- Do not use floating-point types for money or authoritative effort totals.
- Never remove or weaken tests to make a build pass.
- Do not introduce a dependency without explaining its need.
- Do not modify unrelated modules during a bounded task.

## Module Pattern

```text
internal/<module>/
├── domain/
├── application/
├── repository/
├── transport/
└── dto/
```

Domain packages must not import HTTP frameworks or database drivers.

## Initial Implementation Order

1. Repository/platform foundation
2. Authentication and project access
3. Requirement draft and submission
4. Review and approval
5. Immutability and version history
6. Audit history

## Verification Expectations

For every task:

1. State the implementation plan.
2. List files to change.
3. Implement only the requested scope.
4. Add or update tests.
5. Run format, lint, unit, integration and build commands.
6. Report changed files, commands and unresolved issues.

Required verification commands:

```bash
gofmt -w .
go vet ./...
go test ./...
go build ./...
```

Never remove tests or weaken authorization to make a build pass.

## Definition of Done

- Business rules implemented in backend
- Permission checks implemented and tested
- Database migration included
- API contract updated
- Frontend success, loading, empty, validation and error states implemented (when frontend is in scope)
- Unit and integration tests pass
- Critical E2E path passes
- Audit events verified
- Documentation updated
- No known critical security issue
