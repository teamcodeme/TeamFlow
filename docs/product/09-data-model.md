# TeamFlow Data Model

## 1. Design Goals

The data model must:

- Preserve all approved requirement versions.
- Link work and tests to exact versions.
- Support traceable approvals.
- Prevent silent edits.
- Support auditability.
- Support project-level authorization.
- Remain understandable and maintainable.

## 2. Core Entity Overview

```text
Organization
 ├── User
 ├── Team
 └── Project
      ├── ProjectMember
      ├── Requirement
      │    ├── RequirementVersion
      │    │    ├── AcceptanceCriterion
      │    │    ├── RequirementApproval
      │    │    ├── Task
      │    │    └── TestCase
      │    ├── Clarification
      │    ├── DecisionLog
      │    └── ChangeRequest
      │         └── ChangeImpact
      ├── Sprint
      ├── Epic
      ├── Defect
      ├── Release
      └── AuditLog
```

## 3. Organization

Fields:

- id: UUID
- code: string, unique
- name: string
- status: ACTIVE, INACTIVE
- timezone: string
- createdAt: timestamp
- updatedAt: timestamp

## 4. User

Fields:

- id: UUID
- organizationId: UUID
- username: string, unique within organization
- email: string
- displayName: string
- passwordHash: string or external identity reference
- status: ACTIVE, INACTIVE, LOCKED
- lastLoginAt: timestamp
- createdAt: timestamp
- updatedAt: timestamp
- version: integer for optimistic locking

## 5. Role and Permission

### Role

- id
- organizationId
- code
- name
- scopeType: GLOBAL, PROJECT
- systemRole: boolean
- createdAt

### Permission

- id
- code
- description

### RolePermission

- roleId
- permissionId

### UserRole

- userId
- roleId
- projectId nullable
- assignedBy
- assignedAt

## 6. Team

Fields:

- id
- organizationId
- code
- name
- description
- status
- createdAt
- updatedAt

### TeamMember

- teamId
- userId
- teamRole
- joinedAt
- leftAt nullable

## 7. Project

Fields:

- id
- organizationId
- projectCode
- name
- description
- status: DRAFT, ACTIVE, ON_HOLD, COMPLETED, ARCHIVED
- startDate
- targetEndDate
- projectManagerId
- createdBy
- createdAt
- updatedAt
- version

### ProjectMember

- id
- projectId
- userId
- projectRole
- active
- joinedAt
- removedAt nullable

Unique constraint:

```text
(projectId, userId)
```

## 8. Requirement

The Requirement entity represents the stable identity across versions.

Fields:

- id: UUID
- projectId: UUID
- requirementNumber: string
- title: string
- currentApprovedVersionId: UUID nullable
- latestVersionId: UUID nullable
- lifecycleStatus
- priority
- createdBy
- createdAt
- updatedAt
- version

Unique constraint:

```text
(projectId, requirementNumber)
```

## 9. RequirementVersion

Fields:

- id
- requirementId
- versionMajor
- versionMinor
- versionLabel
- baseVersionId nullable
- changeRequestId nullable
- status
- businessObjective
- detailedDescription
- actorsJson
- preconditionsJson
- mainWorkflowJson
- alternativeWorkflowsJson
- businessRulesJson
- assumptionsJson
- dependenciesJson
- outOfScopeJson
- securityConsiderations
- performanceConsiderations
- changeSummary
- createdBy
- createdAt
- submittedAt nullable
- approvedAt nullable
- approvedSnapshotHash nullable
- rowVersion

Important constraints:

- Approved records must not be updated.
- Version label must be unique per requirement.
- Only one version may be current approved.
- baseVersionId must belong to the same requirement.

## 10. AcceptanceCriterion

Fields:

- id
- requirementVersionId
- criterionNumber
- givenText
- whenText
- thenText
- description
- priority
- active
- createdAt
- updatedAt

Unique constraint:

```text
(requirementVersionId, criterionNumber)
```

## 11. RequirementApproval

Fields:

- id
- requirementVersionId
- reviewStage
- reviewerId
- reviewerRole
- decision: APPROVED, REJECTED, CHANGES_REQUESTED, ON_HOLD
- comment
- decidedAt
- sequenceNumber
- createdAt

Approval records should be append-only.

## 12. Clarification

Fields:

- id
- projectId
- requirementId
- requirementVersionId
- question
- askedBy
- assignedTo
- dueAt
- status: OPEN, ANSWERED, RESOLVED, CANCELLED
- response
- respondedBy
- respondedAt
- blocking
- createdAt
- updatedAt

## 13. DecisionLog

Fields:

- id
- projectId
- requirementVersionId
- clarificationId nullable
- decisionTitle
- decisionText
- decidedBy
- confirmedBy
- confirmedAt
- appliesFromVersionId
- createdAt

Decision records should be append-only.

## 14. ChangeRequest

Fields:

- id
- projectId
- changeRequestNumber
- requirementId
- baseRequirementVersionId
- proposedRequirementVersionId nullable
- requestedChange
- businessReason
- urgency
- consequenceIfRejected
- desiredReleaseId nullable
- status
- riskLevel
- requestedBy
- requestedAt
- submittedAt nullable
- finalDecision
- finalDecisionReason
- decidedBy nullable
- decidedAt nullable
- createdAt
- updatedAt
- rowVersion

Unique constraint:

```text
(projectId, changeRequestNumber)
```

## 15. ChangeImpact

Fields:

- id
- changeRequestId
- businessImpact
- operationalImpact
- frontendMinutes
- backendMinutes
- databaseMinutes
- integrationMinutes
- qaMinutes
- documentationMinutes
- reworkMinutes
- timelineImpactDays
- regressionRequired
- migrationRequired
- affectedSprintId nullable
- affectedReleaseId nullable
- affectedModulesJson
- dependencyImpact
- securityImpact
- performanceImpact
- technicalRecommendation
- qaRecommendation
- pmRecommendation
- completedBy
- completedAt
- createdAt
- updatedAt

## 16. Sprint

Fields:

- id
- projectId
- sprintNumber
- name
- goal
- status: PLANNED, ACTIVE, COMPLETED, CANCELLED
- startDate
- endDate
- createdAt
- updatedAt

## 17. Epic

Fields:

- id
- projectId
- code
- title
- description
- status
- ownerId
- createdAt
- updatedAt

## 18. Task

Fields:

- id
- projectId
- epicId nullable
- sprintId nullable
- taskNumber
- taskType: FRONTEND, BACKEND, DATABASE, INTEGRATION, QA_SUPPORT, DOCUMENTATION, DEVOPS, TECH_DEBT
- title
- description
- status
- priority
- assigneeId nullable
- estimatedMinutes
- actualMinutes nullable
- startDate nullable
- dueDate nullable
- blockerReason nullable
- reopenedReason nullable
- createdBy
- createdAt
- updatedAt
- rowVersion

### TaskRequirementVersion

Join entity:

- taskId
- requirementVersionId
- relationshipType: IMPLEMENTS, SUPPORTS, IMPACTED_BY

## 19. TaskStatusHistory

Fields:

- id
- taskId
- previousStatus
- newStatus
- reason
- changedBy
- changedAt

## 20. TestCase

Fields:

- id
- projectId
- testCaseNumber
- requirementVersionId
- title
- preconditions
- priority
- status: DRAFT, READY, REVIEW_REQUIRED, DEPRECATED
- automated
- createdBy
- createdAt
- updatedAt
- rowVersion

## 21. TestStep

Fields:

- id
- testCaseId
- stepNumber
- action
- expectedResult

Unique constraint:

```text
(testCaseId, stepNumber)
```

## 22. TestExecution

Fields:

- id
- testCaseId
- releaseId nullable
- sprintId nullable
- executedBy
- executedAt
- result: PASSED, FAILED, BLOCKED, NOT_RUN
- actualResult
- environment
- evidenceSummary
- createdAt

## 23. Defect

Fields:

- id
- projectId
- defectNumber
- requirementVersionId
- testExecutionId nullable
- relatedTaskId nullable
- title
- description
- severity
- priority
- status
- assigneeId nullable
- rootCause nullable
- resolution nullable
- reopenedReason nullable
- createdBy
- createdAt
- updatedAt
- rowVersion

## 24. Release

Fields:

- id
- projectId
- releaseCode
- name
- versionLabel
- status: DRAFT, READY_FOR_REVIEW, APPROVED, DEPLOYED, CANCELLED
- plannedDate
- deployedAt nullable
- releaseNotes
- createdBy
- createdAt
- updatedAt

Join entities:

- ReleaseRequirementVersion
- ReleaseTask
- ReleaseDefect

## 25. Attachment

Fields:

- id
- projectId
- entityType
- entityId
- fileName
- contentType
- sizeBytes
- storageKey
- uploadedBy
- uploadedAt
- checksum
- malwareScanStatus

## 26. Notification

Fields:

- id
- userId
- type
- title
- message
- entityType
- entityId
- readAt nullable
- createdAt

## 27. AuditLog

Fields:

- id
- organizationId
- projectId nullable
- actorUserId nullable
- actorType
- action
- entityType
- entityId
- previousStateJson nullable
- newStateJson nullable
- reason nullable
- traceId
- ipAddress nullable
- userAgent nullable
- createdAt
- previousHash nullable
- eventHash nullable

AuditLog must be append-only.

## 28. Indexing Recommendations

Indexes should include:

- Requirement(projectId, lifecycleStatus)
- RequirementVersion(requirementId, versionMajor, versionMinor)
- RequirementApproval(requirementVersionId, reviewStage)
- ChangeRequest(projectId, status)
- Task(projectId, status, assigneeId)
- TestCase(requirementVersionId, status)
- Defect(projectId, status, severity)
- AuditLog(projectId, createdAt)
- Notification(userId, readAt, createdAt)

## 29. Transaction Boundaries

The following operations must be transactional:

- Requirement approval and snapshot creation
- Current approved version update
- Change approval and new version creation
- Task reopening and history creation
- Test execution and defect creation when performed together
- Release approval and readiness snapshot
- Business mutation and audit-event insertion
