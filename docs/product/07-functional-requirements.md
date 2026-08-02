# TeamFlow Functional Requirements

## 1. Authentication and Access

### FR-AUTH-001
The system shall allow active users to authenticate using approved credentials.

### FR-AUTH-002
The system shall deny access to inactive, locked, or expired accounts.

### FR-AUTH-003
The system shall support role-based access control.

### FR-AUTH-004
The system shall support project-specific membership and roles.

### FR-AUTH-005
The backend shall validate authorization for every protected operation.

### FR-AUTH-006
The system shall record login success, login failure, logout, password reset, and account lock events.

## 2. User Management

### FR-USER-001
An authorized administrator shall be able to create, update, activate, and deactivate users.

### FR-USER-002
An authorized administrator shall be able to assign global roles.

### FR-USER-003
A Project Manager or authorized administrator shall be able to assign users to projects.

### FR-USER-004
The system shall prevent removal of the last required project administrator where configured.

## 3. Project Management

### FR-PROJ-001
Authorized users shall be able to create a project with code, name, description, status, start date, and target end date.

### FR-PROJ-002
The system shall enforce unique project codes.

### FR-PROJ-003
Authorized users shall be able to archive a project.

### FR-PROJ-004
Archived projects shall remain readable according to permissions but shall reject normal operational updates.

### FR-PROJ-005
The system shall display project-level requirement, task, QA, defect, release, and change metrics.

## 4. Requirement Management

### FR-REQ-001
A BA shall be able to create a requirement in DRAFT status.

### FR-REQ-002
A requirement shall include project, title, objective, description, actors, workflow, business rules, acceptance criteria, priority, and author.

### FR-REQ-003
The system shall validate mandatory fields before submission.

### FR-REQ-004
The system shall allow attachments and comments.

### FR-REQ-005
The system shall assign a human-readable requirement number.

Example:

```text
REQ-PMB-0042
```

### FR-REQ-006
The system shall allow filtering by project, status, author, priority, release, and date.

### FR-REQ-007
The system shall maintain requirement status history.

## 5. Requirement Approval

### FR-APR-001
The system shall support configurable review stages.

### FR-APR-002
Reviewers shall be able to approve, reject, request changes, or place the requirement on hold.

### FR-APR-003
Review comments shall be mandatory for rejection and changes requested.

### FR-APR-004
The system shall prevent final approval until required reviews are complete.

### FR-APR-005
The system shall prevent an author from providing prohibited self-approval.

### FR-APR-006
Approval records shall include reviewer, role, decision, timestamp, and comment.

## 6. Requirement Versioning

### FR-VER-001
The system shall create version 1.0 for the first approved requirement version.

### FR-VER-002
Approved versions shall be immutable.

### FR-VER-003
Any post-approval change shall create a new draft version.

### FR-VER-004
The system shall preserve all previous versions.

### FR-VER-005
The system shall support field-level version comparison.

### FR-VER-006
A new version shall reference its base version and related change request.

### FR-VER-007
Only one version may be designated as the current approved version at a time.

## 7. Clarification Management

### FR-CLR-001
Authorized users shall be able to ask a clarification against a requirement version.

### FR-CLR-002
A clarification shall include question, asker, assignee, due date, status, and response.

### FR-CLR-003
The system shall notify the assignee.

### FR-CLR-004
Authorized users shall be able to confirm a clarification response as an official decision.

### FR-CLR-005
Unresolved blocking clarifications shall prevent configured workflow transitions.

## 8. Change Request Management

### FR-CR-001
Authorized users shall be able to create a change request against an approved requirement version.

### FR-CR-002
A change request shall include requested change, business reason, urgency, consequence of rejection, and desired delivery period.

### FR-CR-003
The system shall assign a unique change request number.

### FR-CR-004
The system shall require impact analysis before approval.

### FR-CR-005
The system shall support approve, reject, defer, request analysis, and cancel decisions.

### FR-CR-006
An approved change shall create or update a draft requirement version.

### FR-CR-007
The original approved version shall remain unchanged.

## 9. Impact Analysis

### FR-IMP-001
The system shall capture business, project, technical, QA, schedule, and risk impacts.

### FR-IMP-002
The system shall calculate total estimated effort.

### FR-IMP-003
The system shall preserve the original estimates after approval.

### FR-IMP-004
Revised estimates shall create a history entry.

### FR-IMP-005
The system shall show affected tasks, tests, releases, modules, and dependencies.

## 10. Sprint and Task Management

### FR-TASK-001
Authorized users shall be able to create epics, sprints, and tasks.

### FR-TASK-002
A development task shall reference at least one approved requirement version unless explicitly classified as administrative or technical debt.

### FR-TASK-003
Tasks shall support assignee, status, priority, estimate, dates, dependencies, and blockers.

### FR-TASK-004
The system shall record status history.

### FR-TASK-005
Reopening a completed task shall require a reason.

### FR-TASK-006
The system shall provide board and list views.

### FR-TASK-007
The system shall prevent unauthorized users from modifying task assignments.

## 11. QA Management

### FR-QA-001
QA users shall be able to create test cases linked to requirement versions.

### FR-QA-002
Test cases shall include preconditions, steps, expected results, priority, and status.

### FR-QA-003
QA users shall be able to execute a test case and record actual results.

### FR-QA-004
The system shall support PASSED, FAILED, BLOCKED, and NOT_RUN execution outcomes.

### FR-QA-005
The system shall support evidence attachments.

### FR-QA-006
When a linked requirement changes, affected test cases shall become REVIEW_REQUIRED.

### FR-QA-007
The system shall calculate requirement test coverage.

## 12. Defect Management

### FR-DEF-001
Authorized users shall be able to create a defect from a test execution.

### FR-DEF-002
A defect shall support severity, priority, status, assignee, root cause, and resolution.

### FR-DEF-003
A defect shall reference the affected requirement version.

### FR-DEF-004
The system shall preserve defect status history.

### FR-DEF-005
Closing a defect shall require a resolution.

### FR-DEF-006
Reopening a defect shall require a reason.

## 13. Release Management

### FR-REL-001
Authorized users shall be able to create releases.

### FR-REL-002
A release shall contain requirements, tasks, tests, and defects.

### FR-REL-003
The system shall calculate release readiness.

### FR-REL-004
The system shall identify blockers such as failed tests, open critical defects, incomplete tasks, or missing acceptance.

### FR-REL-005
The system shall support BA, QA, technical, and management approval where configured.

### FR-REL-006
The release decision shall be auditable.

## 14. Notifications

### FR-NOT-001
The system shall create in-application notifications for assigned actions.

### FR-NOT-002
Users shall be able to mark notifications as read.

### FR-NOT-003
The system shall support notification preferences for non-critical notifications.

### FR-NOT-004
Critical approval and security notifications shall not be disabled by normal users.

## 15. Dashboards and Reporting

### FR-RPT-001
The system shall provide project, team, and management dashboards.

### FR-RPT-002
The management dashboard shall display requirement stability, change count, rework, QA retesting, approval delays, and release risk.

### FR-RPT-003
The system shall support date and project filtering.

### FR-RPT-004
Authorized users shall be able to export selected reports to CSV.

### FR-RPT-005
Exports shall be audited.

## 16. Audit

### FR-AUD-001
The system shall record security-sensitive and business-critical actions.

### FR-AUD-002
Audit events shall include actor, action, entity, entity ID, timestamp, previous state where applicable, new state where applicable, and trace ID.

### FR-AUD-003
Audit records shall not be editable through normal APIs.

### FR-AUD-004
Audit access shall be restricted.

### FR-AUD-005
The system shall support filtering audit events by actor, project, action, entity, and date.
