# TeamFlow API Contract

## 1. API Standards

Base path:

```text
/api/v1
```

Content type:

```text
application/json
```

Authentication:

```text
Authorization: Bearer <token>
```

Trace header:

```text
X-Trace-ID
```

The server must return a trace ID in responses.

## 2. Standard Success Response

For a single resource:

```json
{
  "data": {
    "id": "uuid"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

For a paginated list:

```json
{
  "data": [],
  "meta": {
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0,
    "traceId": "trace-id"
  }
}
```

## 3. Standard Error Response

```json
{
  "code": "REQUIREMENT_VERSION_IMMUTABLE",
  "message": "An approved requirement version cannot be edited.",
  "details": {
    "requirementVersionId": "uuid"
  },
  "traceId": "trace-id"
}
```

## 4. Common Status Codes

- 200 OK
- 201 Created
- 204 No Content
- 400 Validation failure
- 401 Unauthenticated
- 403 Unauthorized
- 404 Resource not found
- 409 Business conflict or optimistic locking failure
- 422 Invalid workflow transition
- 429 Rate limit exceeded
- 500 Unexpected server error

## 5. Pagination

Query parameters:

```text
page=0
size=20
sort=createdAt,desc
```

Maximum page size should be configurable.

## 6. Filtering

Example:

```text
GET /api/v1/projects/{projectId}/requirements?status=APPROVED&priority=HIGH
```

## 7. Optimistic Locking

Editable resources should include:

```json
{
  "rowVersion": 3
}
```

A stale update returns:

```text
409 CONFLICT
```

Error code:

```text
OPTIMISTIC_LOCK_FAILED
```

## 8. Project APIs

### Create Project

```http
POST /api/v1/projects
```

Request:

```json
{
  "projectCode": "PMB",
  "name": "PMB Gateway",
  "description": "Project description",
  "startDate": "2026-08-01",
  "targetEndDate": "2026-12-31"
}
```

### Get Project

```http
GET /api/v1/projects/{projectId}
```

### List Projects

```http
GET /api/v1/projects
```

### Add Member

```http
POST /api/v1/projects/{projectId}/members
```

## 9. Requirement APIs

### Create Requirement

```http
POST /api/v1/projects/{projectId}/requirements
```

Request:

```json
{
  "title": "Regional staff warehouse access",
  "priority": "HIGH",
  "businessObjective": "Restrict staff access to assigned warehouses.",
  "detailedDescription": "Regional staff must only view assigned warehouses.",
  "actors": ["REGIONAL_STAFF"],
  "preconditions": ["User is authenticated"],
  "mainWorkflow": [
    "User logs in",
    "System resolves warehouse assignments",
    "System displays assigned warehouses only"
  ],
  "businessRules": [
    "A regional staff member may access assigned warehouses only"
  ],
  "acceptanceCriteria": [
    {
      "given": "A user is assigned to Warehouse A",
      "when": "The user opens the warehouse page",
      "then": "Only Warehouse A is displayed"
    }
  ],
  "outOfScope": [
    "Automatic warehouse assignment"
  ]
}
```

### Get Requirement

```http
GET /api/v1/projects/{projectId}/requirements/{requirementId}
```

### Update Draft Version

```http
PUT /api/v1/projects/{projectId}/requirements/{requirementId}/versions/{versionId}
```

The endpoint must reject updates to approved versions.

### Submit Requirement Version

```http
POST /api/v1/projects/{projectId}/requirements/{requirementId}/versions/{versionId}/submit
```

### Approve Review Stage

```http
POST /api/v1/projects/{projectId}/requirements/{requirementId}/versions/{versionId}/reviews
```

Request:

```json
{
  "reviewStage": "TECHNICAL_REVIEW",
  "decision": "APPROVED",
  "comment": "Technically feasible."
}
```

### Approve Requirement Version

```http
POST /api/v1/projects/{projectId}/requirements/{requirementId}/versions/{versionId}/approve
```

### Compare Versions

```http
GET /api/v1/projects/{projectId}/requirements/{requirementId}/versions/compare?from={versionA}&to={versionB}
```

Response includes field-level differences.

## 10. Clarification APIs

### Create Clarification

```http
POST /api/v1/projects/{projectId}/requirements/{requirementId}/versions/{versionId}/clarifications
```

### Respond

```http
POST /api/v1/clarifications/{clarificationId}/responses
```

### Confirm Decision

```http
POST /api/v1/clarifications/{clarificationId}/confirm-decision
```

## 11. Change Request APIs

### Create Change Request

```http
POST /api/v1/projects/{projectId}/change-requests
```

Request:

```json
{
  "requirementId": "uuid",
  "baseRequirementVersionId": "uuid",
  "requestedChange": "Allow assignment to two warehouses.",
  "businessReason": "Operational coverage requires two warehouse assignments.",
  "urgency": "HIGH",
  "consequenceIfRejected": "Manual reassignment will continue."
}
```

### Submit Change Request

```http
POST /api/v1/change-requests/{changeRequestId}/submit
```

### Add Impact Analysis

```http
PUT /api/v1/change-requests/{changeRequestId}/impact
```

Request:

```json
{
  "frontendMinutes": 480,
  "backendMinutes": 720,
  "databaseMinutes": 120,
  "qaMinutes": 360,
  "reworkMinutes": 240,
  "timelineImpactDays": 2,
  "regressionRequired": true,
  "migrationRequired": false,
  "riskLevel": "MEDIUM",
  "technicalRecommendation": "Approve for current sprint.",
  "qaRecommendation": "Regression testing required.",
  "pmRecommendation": "Delivery date should move by two days."
}
```

### Decide Change Request

```http
POST /api/v1/change-requests/{changeRequestId}/decision
```

Request:

```json
{
  "decision": "APPROVED_CURRENT_SPRINT",
  "reason": "Business impact justifies the delay."
}
```

## 12. Task APIs

### Create Task

```http
POST /api/v1/projects/{projectId}/tasks
```

### Update Task Status

```http
POST /api/v1/tasks/{taskId}/transitions
```

Request:

```json
{
  "targetStatus": "READY_FOR_QA",
  "reason": "Implementation and code review completed."
}
```

### Reopen Task

```http
POST /api/v1/tasks/{taskId}/reopen
```

A reason is mandatory.

## 13. QA APIs

### Create Test Case

```http
POST /api/v1/projects/{projectId}/test-cases
```

### Execute Test Case

```http
POST /api/v1/test-cases/{testCaseId}/executions
```

Request:

```json
{
  "result": "PASSED",
  "actualResult": "Only assigned warehouses were displayed.",
  "environment": "QA"
}
```

### Create Defect

```http
POST /api/v1/projects/{projectId}/defects
```

## 14. Release APIs

### Create Release

```http
POST /api/v1/projects/{projectId}/releases
```

### Get Readiness

```http
GET /api/v1/releases/{releaseId}/readiness
```

### Approve Release Stage

```http
POST /api/v1/releases/{releaseId}/approvals
```

## 15. Dashboard APIs

```http
GET /api/v1/projects/{projectId}/dashboard
GET /api/v1/dashboard/team
GET /api/v1/dashboard/management
```

Management dashboard response should include:

- requirementCount
- approvedRequirementCount
- postApprovalChangeCount
- estimatedReworkMinutes
- qaRetestMinutes
- reopenedTaskCount
- blockedTaskCount
- unresolvedClarificationCount
- openCriticalDefectCount
- deliveryImpactDays

## 16. Audit APIs

```http
GET /api/v1/audit-events
GET /api/v1/projects/{projectId}/audit-events
```

Audit APIs are read-only.

## 17. Idempotency

High-value create or transition endpoints should accept:

```text
Idempotency-Key
```

Recommended for:

- Approval
- Change decision
- Test execution
- Release approval
- Notification-producing transitions

## 18. Validation Rules

- IDs must be valid UUIDs.
- User must belong to the project.
- Status transition must be allowed.
- Approved versions cannot be updated.
- Required comments must be provided.
- Attachment type and size must be validated.
- Effort values cannot be negative.
- Timeline impact cannot be negative unless explicitly modeled.
- A change request must reference an approved base version.
