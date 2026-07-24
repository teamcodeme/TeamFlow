# TeamFlow Change Request Workflow

## 1. Objective

The change request workflow controls changes made after a requirement version has been approved.

TeamFlow does not prevent requirement changes. It ensures that each change is documented, assessed, approved, planned, implemented, tested, and closed.

## 2. Change Request Lifecycle

```text
DRAFT
  ↓
SUBMITTED
  ↓
IMPACT_ANALYSIS_REQUIRED
  ↓
UNDER_REVIEW
  ↓
APPROVED
  ↓
PLANNED
  ↓
IN_IMPLEMENTATION
  ↓
IMPLEMENTED
  ↓
QA_VERIFIED
  ↓
CLOSED
```

Alternative states:

```text
CHANGES_REQUESTED
DEFERRED
REJECTED
CANCELLED
```

## 3. Change Request Creation

A change request must reference:

- Project
- Requirement
- Current approved requirement version
- Requested change
- Business reason
- Requested by
- Requested date
- Urgency
- Consequence of not implementing
- Desired release or date
- Initial affected modules

The original approved requirement version remains unchanged.

## 4. Submission Validation

Before submission, the system validates:

- A current approved version exists.
- The requested change is described.
- A business reason is supplied.
- The requester is authorized.
- The request is not a duplicate of an open change request.
- Required attachments are included.

## 5. Impact Analysis

The system assigns impact sections to the relevant roles.

### 5.1 Business Impact

Usually completed by BA or Product Owner:

- Business value
- User impact
- Compliance impact
- Operational impact
- Urgency
- Consequence of rejection
- Affected business process

### 5.2 Project Impact

Usually completed by PM:

- Affected sprint
- Affected milestone
- Affected release
- Timeline impact
- Resource impact
- Dependency impact
- Delivery recommendation

### 5.3 Technical Impact

Usually completed by Technical Lead or Developer:

- Frontend effort
- Backend effort
- Database effort
- Integration effort
- Architecture impact
- Migration requirement
- Security impact
- Performance impact
- Technical risk
- Rework effort

### 5.4 QA Impact

Usually completed by QA:

- New test cases
- Existing test cases requiring review
- Regression scope
- Test data impact
- Environment impact
- Automation impact
- QA effort
- Quality risk

## 6. Effort Representation

Effort should be recorded using whole minutes or decimal hours represented safely in the database. Floating-point storage should not be used for cost or financial values.

Suggested fields:

- estimatedFrontendMinutes
- estimatedBackendMinutes
- estimatedDatabaseMinutes
- estimatedIntegrationMinutes
- estimatedQaMinutes
- estimatedDocumentationMinutes
- estimatedReworkMinutes
- totalEstimatedMinutes

## 7. Risk Classification

Suggested risk levels:

- LOW
- MEDIUM
- HIGH
- CRITICAL

Risk factors may include:

- Production data migration
- Security changes
- External integration
- Regulatory impact
- Release deadline proximity
- Large regression scope
- Architecture changes
- Cross-project dependency

## 8. Review

Reviewers may:

- Approve
- Reject
- Request more information
- Request revised estimates
- Defer to a later release
- Split the change into multiple requests
- Escalate for management approval

## 9. Approval Rules

Approval levels may depend on impact.

Example:

- Low impact: PM + Technical Lead
- Medium impact: PM + Technical Lead + QA Lead
- High impact: CTO approval required
- Critical business change: CTO and Management approval required

The requester must not provide the final approval when separation of duties applies.

## 10. Approval Result

### Approved for Current Sprint

The system:

- Creates a new draft requirement version.
- Copies the previous approved version.
- Applies the accepted change proposal.
- Links the new version to the change request.
- Marks affected tasks and tests for review.
- Updates planning information.
- Records approval history.

### Approved for Future Release

The change request becomes DEFERRED or PLANNED for the selected release.

### Rejected

The original approved requirement remains active. The rejection reason is mandatory.

### More Analysis Required

The request returns to IMPACT_ANALYSIS_REQUIRED.

## 11. New Version Creation

The new requirement version must include:

- Parent requirement
- Base approved version
- Change request
- New version number
- Change summary
- Changed fields
- Created by
- Created date
- Draft status

The new version must complete required review before approval.

## 12. Affected Work Handling

When a change is approved:

- Completed tasks may become IMPACT_REVIEW_REQUIRED.
- In-progress tasks receive a change notification.
- Linked test cases become REVIEW_REQUIRED.
- Planned release readiness is recalculated.
- Related defects remain attached to the correct version.
- New tasks may be created.
- Existing estimates remain historically visible.

## 13. Implementation

The change request becomes IN_IMPLEMENTATION when approved tasks begin.

Implementation evidence may include:

- Task links
- Pull request references
- Migration references
- Screenshots
- Technical notes
- Test evidence

## 14. QA Verification

QA verifies the changed requirement version.

The request cannot close while:

- Required test cases are incomplete.
- Critical defects remain open.
- Mandatory regression testing has not passed.
- The new version has not been approved.

## 15. Closure

A change request may close when:

- New requirement version is approved.
- Implementation is complete.
- QA verification is complete.
- BA acceptance is complete where required.
- Release assignment is confirmed.
- Final impact metrics are recorded.

## 16. Metrics

The system must calculate:

- Number of post-approval changes
- Changes by project
- Changes by source role
- Rework time
- QA retesting time
- Average approval time
- Average impact-analysis time
- Changes deferred
- Changes rejected
- Tasks reopened
- Test cases requiring review
- Delivery days affected

Metrics must be used to improve process, not create personal harassment rankings.

## 17. Audit Requirements

The system records:

- Request creation
- Every edit
- Submission
- Assigned reviewers
- Impact entries
- Approval decisions
- Deferral
- Rejection
- Version creation
- Planning updates
- Implementation status
- QA result
- Closure
