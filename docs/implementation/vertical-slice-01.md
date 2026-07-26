# Vertical Slice 01 — Requirement Approval and Immutability

## Scope

- Create project
- Add project member
- Create requirement draft
- Add acceptance criteria
- Update draft using optimistic locking
- Submit draft
- Record BA, PM, Technical, and QA reviews
- Final approval
- Version 1.0 lock
- Version history
- Audit history

## Explicit workflow endpoints

```text
POST /api/v1/projects
POST /api/v1/projects/{projectId}/members
POST /api/v1/projects/{projectId}/requirements
GET  /api/v1/projects/{projectId}/requirements
GET  /api/v1/projects/{projectId}/requirements/{requirementId}
PUT  /api/v1/requirements/{requirementId}/versions/{versionId}
POST /api/v1/requirements/{requirementId}/versions/{versionId}/submit
POST /api/v1/requirements/{requirementId}/versions/{versionId}/reviews
POST /api/v1/requirements/{requirementId}/versions/{versionId}/approve
GET  /api/v1/requirements/{requirementId}/versions
GET  /api/v1/requirements/{requirementId}/audit-events
```

## Generated CRUD restrictions

Disable or strictly protect unrestricted update/delete endpoints for:

- RequirementVersion
- RequirementApproval
- TeamFlowAuditEvent / generated audit_log

## Required tests

- Project outsider receives 403.
- Draft can be edited.
- Stale draft update receives 409.
- Missing acceptance criteria prevents submission.
- Submitted version cannot be freely edited.
- Required reviews are enforced.
- Prohibited self-approval is rejected.
- Approval creates Version 1.0.
- Only one current approved version exists.
- Approved update/delete is rejected by service and database.
- Duplicate/concurrent approval is safe.
- Audit failure rolls back approval.
