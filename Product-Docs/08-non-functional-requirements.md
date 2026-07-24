# TeamFlow Non-Functional Requirements

## 1. Availability

### NFR-AVL-001
The production system should target at least 99.5% monthly availability during the pilot.

### NFR-AVL-002
Planned maintenance should be communicated in advance.

### NFR-AVL-003
The application shall expose health and readiness endpoints.

## 2. Performance

### NFR-PERF-001
Normal list APIs should return within 2 seconds for the 95th percentile under expected pilot load.

### NFR-PERF-002
Requirement detail should load within 2 seconds for the 95th percentile.

### NFR-PERF-003
Version comparison should complete within 3 seconds for typical requirement sizes.

### NFR-PERF-004
Management dashboard queries should complete within 5 seconds for pilot-scale data.

### NFR-PERF-005
The system should support at least 100 concurrent pilot users.

## 3. Scalability

### NFR-SCL-001
The architecture shall allow horizontal scaling of stateless API instances.

### NFR-SCL-002
Application sessions shall not depend on local server memory where avoidable.

### NFR-SCL-003
The data model shall support at least:

- 10,000 requirements
- 50,000 requirement versions
- 100,000 tasks
- 100,000 test executions
- 500,000 audit events

without redesigning core entities.

## 4. Security

### NFR-SEC-001
All production traffic shall use TLS.

### NFR-SEC-002
Passwords shall be hashed using an approved adaptive algorithm.

### NFR-SEC-003
Authorization shall be validated in the backend.

### NFR-SEC-004
Sensitive actions shall be audited.

### NFR-SEC-005
The system shall protect against common OWASP application risks.

### NFR-SEC-006
Secrets shall not be stored in source control.

### NFR-SEC-007
Tokens shall have controlled expiry.

### NFR-SEC-008
File uploads shall be validated by size, type, and content policy.

## 5. Reliability

### NFR-REL-001
Requirement approval and version creation shall occur inside a database transaction.

### NFR-REL-002
The system shall prevent multiple current approved versions for the same requirement.

### NFR-REL-003
Important mutation APIs should support safe retry or idempotency where appropriate.

### NFR-REL-004
Failed transactions shall not create partial audit or version state.

## 6. Data Integrity

### NFR-DATA-001
Foreign keys shall protect core relationships.

### NFR-DATA-002
Approved requirement versions shall be protected from update.

### NFR-DATA-003
Status transitions shall be validated.

### NFR-DATA-004
Optimistic locking shall be used for concurrent editable records.

### NFR-DATA-005
Dates and timestamps shall be stored consistently in UTC.

## 7. Maintainability

### NFR-MNT-001
The codebase shall use modular domain boundaries.

### NFR-MNT-002
Business rules shall not be implemented only in UI components.

### NFR-MNT-003
Database migrations shall be version-controlled.

### NFR-MNT-004
Public APIs shall be documented using OpenAPI.

### NFR-MNT-005
Important architecture decisions shall be recorded as ADR documents.

### NFR-MNT-006
Automated tests shall cover critical domain workflows.

## 8. Observability

### NFR-OBS-001
The API shall produce structured logs.

### NFR-OBS-002
Every request shall receive a trace or correlation ID.

### NFR-OBS-003
Logs shall not contain passwords, tokens, or unnecessary personal data.

### NFR-OBS-004
The system shall provide metrics for request rate, error rate, latency, and database health.

### NFR-OBS-005
Critical errors shall be distinguishable from validation failures.

## 9. Usability

### NFR-USA-001
Users shall be able to identify the current approved requirement version without opening version history.

### NFR-USA-002
Status labels shall use consistent wording and visual treatment.

### NFR-USA-003
Required actions shall display clear reasons when blocked.

### NFR-USA-004
Forms shall preserve user input after recoverable validation errors.

### NFR-USA-005
The application shall include useful empty, loading, and error states.

## 10. Accessibility

### NFR-ACC-001
The application should target WCAG 2.1 AA for primary workflows.

### NFR-ACC-002
Keyboard navigation shall be supported.

### NFR-ACC-003
Interactive elements shall have accessible labels.

### NFR-ACC-004
Color shall not be the only method used to communicate status.

## 11. Compatibility

### NFR-COMP-001
The web application shall support current versions of Chrome, Edge, Firefox, and Safari used by the organization.

### NFR-COMP-002
The primary interface shall support desktop resolutions from 1280 pixels wide.

### NFR-COMP-003
Core read and approval functions should remain usable on tablets.

## 12. Backup and Recovery

### NFR-BCK-001
The production database shall be backed up regularly.

### NFR-BCK-002
A documented restore procedure shall exist.

### NFR-BCK-003
Backups shall be encrypted where supported.

### NFR-BCK-004
Restore tests shall be performed before pilot approval.

### NFR-BCK-005
The initial pilot should target:

- Recovery Point Objective: 24 hours or better
- Recovery Time Objective: 4 hours or better

## 13. Deployment

### NFR-DEP-001
The system shall support local development without Kubernetes.

### NFR-DEP-002
The application shall support OCI-compatible container images.

### NFR-DEP-003
Environment-specific settings shall be supplied through environment variables or secret management.

### NFR-DEP-004
Database migrations shall run through a controlled deployment process.

## 14. Privacy

### NFR-PRV-001
The system shall collect only information required for project delivery and governance.

### NFR-PRV-002
Access to personal user data shall be restricted.

### NFR-PRV-003
Audit and reporting functions shall avoid unnecessary personal profiling.

### NFR-PRV-004
Retention periods shall be configurable according to company policy.

## 15. Localization

### NFR-L10N-001
The MVP may launch in English.

### NFR-L10N-002
Text labels should be structured to allow future localization.

### NFR-L10N-003
Dates and times shall display according to user or organization settings.
