# TeamFlow Engineering Instructions

## Product rule

Approved requirement versions are immutable. Any post-approval change must use a formal new version and, in later milestones, a change request.

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

Do not implement Angular, change requests, sprint planning, QA, defects, releases, dashboards, messaging, AI, microservices, or Kubernetes yet.

## Generator rules

- Preserve `.go-duck/` generator state.
- Preserve all GO-DUCK needle comments.
- Extend generated code through supported extension points.
- Do not regenerate over custom business logic without inspecting the diff.
- Treat GDL as the schema source of truth.

## Architecture rules

- Modular monolith.
- PostgreSQL primary database.
- REST/OpenAPI.
- Keycloak OIDC authentication.
- Project-scoped authorization in addition to realm roles.
- Backend authorization is mandatory.
- Workflow transitions belong in application/domain services, not controllers.
- Approval, current-version update, approval record, and audit record must be one transaction.
- Do not expose unrestricted update/delete CRUD for RequirementVersion, RequirementApproval, or AuditLog.
- Use optimistic locking for editable records.
- Store timestamps in UTC.
- Do not use floating-point values for effort or money.

## Required verification

Run:

```bash
gofmt -w .
go vet ./...
go test ./...
go build ./...
```

Never remove tests or weaken authorization to make a build pass.
