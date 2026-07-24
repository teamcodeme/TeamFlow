# TeamFlow User Roles and Permissions

## 1. Purpose

This document defines the initial TeamFlow roles, responsibilities, permissions, and restrictions.

Authorization must be enforced by the backend. Hiding a button in the frontend is not sufficient security.

## 2. Role Design Principles

- Users may hold more than one role.
- Project-specific roles may differ from global roles.
- Access must follow least-privilege principles.
- Sensitive decisions require explicit permission.
- Users must not approve their own restricted submissions where separation of duties is required.
- Management overrides must require a reason.
- Audit records must capture permission-sensitive actions.

## 3. SYSTEM_ADMIN

### Responsibilities

- Maintain users and system configuration.
- Manage global roles.
- Maintain organization settings.
- Support authentication and access issues.
- Review system health and audit events.

### Permissions

- Create and update users.
- Activate and deactivate users.
- Assign global roles.
- Configure system settings.
- View all projects for administration.
- View security audit logs.
- Manage reference data.
- Reset passwords.
- Manage feature flags.

### Restrictions

- Must not modify approved requirements unless separately assigned a business role.
- Must not delete audit records.
- Must not approve business changes solely because of administrative access.

## 4. CTO

### Responsibilities

- Provide technical governance.
- Review major technical risks.
- Approve high-impact changes.
- Review architecture and security.
- Approve release readiness where required.

### Permissions

- View all internal projects.
- Review technical assessments.
- Approve or reject high-risk change requests.
- Add technical decision comments.
- Override technical decisions with a mandatory reason.
- View management dashboards.
- View audit records.
- Approve releases.
- Request additional analysis.

### Restrictions

- Overrides must be logged.
- Approved requirement history cannot be deleted or rewritten.

## 5. MANAGEMENT

### Responsibilities

- Review portfolio-level delivery information.
- Approve business-critical scope changes.
- Review project risks, delays, and rework.

### Permissions

- View executive dashboards.
- View project summaries.
- Review major change requests.
- Approve or reject business-level decisions where configured.
- View impact analysis.
- View release readiness.
- Export approved reports.

### Restrictions

- Cannot edit technical estimates directly.
- Cannot modify approved requirement versions.
- Override actions require a reason.

## 6. PROJECT_MANAGER

### Responsibilities

- Plan approved work.
- Manage schedules, sprints, assignments, and dependencies.
- Review change impact.
- Communicate delivery consequences.

### Permissions

- Create and manage project plans.
- Add members to assigned projects.
- Review submitted requirements.
- Request requirement changes before approval.
- Create epics, sprints, and tasks.
- Assign work.
- Update schedules.
- Add PM impact analysis.
- Recommend change approval or deferral.
- View QA and delivery status.
- Create releases.
- Generate project reports.

### Restrictions

- Cannot directly edit an approved requirement.
- Cannot change developer or QA estimates without recorded justification.
- Cannot delete requirement or approval history.

## 7. BUSINESS_ANALYST

### Responsibilities

- Discover and document business requirements.
- Define workflows, business rules, assumptions, and acceptance criteria.
- Respond to clarifications.
- Validate delivered functionality.

### Permissions

- Create requirements.
- Edit draft requirements.
- Submit requirements for review.
- Add acceptance criteria.
- Upload business attachments.
- Respond to clarifications.
- Create change requests.
- Review requirement versions.
- Perform BA acceptance.
- Add business impact information.
- View linked tasks, tests, and defects.

### Restrictions

- Cannot directly edit approved requirement versions.
- Cannot modify developer estimates.
- Cannot close technical tasks.
- Cannot alter QA execution results.
- Cannot delete decision or audit history.

## 8. TECHNICAL_LEAD

### Responsibilities

- Review feasibility.
- Identify technical dependencies and risks.
- Estimate technical impact.
- Support developers.
- Approve technical readiness.

### Permissions

- Review requirements.
- Approve or reject technical review.
- Add technical notes.
- Create and assign technical tasks.
- Add technical impact analysis.
- Review architecture decisions.
- Review pull request references.
- Confirm implementation readiness.
- Approve release technical readiness.

### Restrictions

- Cannot alter business requirements.
- Cannot perform BA acceptance.
- Cannot overwrite QA outcomes.
- Cannot delete approved versions.

## 9. DEVELOPER

### Responsibilities

- Implement approved tasks.
- Record progress and blockers.
- Request clarifications.
- Add technical notes and evidence.
- Fix defects.

### Permissions

- View assigned projects.
- View approved requirement versions.
- View version history.
- Update assigned tasks.
- Add estimates where permitted.
- Request clarification.
- Add blockers.
- Link commits or pull requests manually.
- Respond to defects.
- Add implementation notes.
- mark work ready for QA.

### Restrictions

- Cannot edit business requirements.
- Cannot approve requirement changes.
- Cannot approve their own release.
- Cannot change test execution results.
- Cannot delete audit history.

## 10. QA_ENGINEER

### Responsibilities

- Review testability.
- Create test cases.
- Execute tests.
- Record evidence.
- Raise and retest defects.
- Report requirement coverage.

### Permissions

- Review requirements before approval.
- Request clarification.
- Create test cases.
- Link test cases to requirement versions.
- Execute tests.
- Attach evidence.
- Create defects.
- Retest defects.
- Add QA impact analysis.
- Approve QA verification.
- Mark test cases for review.
- View change history.

### Restrictions

- Cannot change business requirements.
- Cannot close development tasks without workflow permission.
- Cannot alter approved requirement versions.
- Cannot perform management approval.

## 11. VIEWER

### Responsibilities

- Read project information without changing it.

### Permissions

- View assigned project dashboards.
- View requirements.
- View approved versions.
- View selected reports.
- View release status.

### Restrictions

- No create, edit, approve, delete, or export permission unless explicitly granted.

## 12. Separation of Duties

The default configuration should enforce:

- A requirement author cannot provide final approval for the same version.
- A developer cannot provide QA verification for their own implementation.
- A user cannot approve a change request they created when higher approval is required.
- A System Administrator cannot use administrative privileges as business approval.
- Management overrides require a reason and audit event.

## 13. Permission Matrix Summary

| Action | Admin | CTO | Mgmt | PM | BA | Tech Lead | Dev | QA | Viewer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Manage users | Yes | View | No | No | No | No | No | No | No |
| Create project | Yes | Yes | Optional | Yes | No | No | No | No | No |
| Create requirement | Optional | No | No | Optional | Yes | Optional | No | No | No |
| Edit draft requirement | Optional | No | No | Optional | Yes | Optional | No | No | No |
| Approve requirement | No | Optional | Optional | Yes | No | Technical only | No | QA review only | No |
| Create change request | Optional | Yes | Optional | Yes | Yes | Yes | Suggest | Suggest | No |
| Add technical impact | No | Yes | No | Review | No | Yes | Optional | No | No |
| Add QA impact | No | View | No | Review | No | No | No | Yes | No |
| Manage tasks | Optional | View | View | Yes | View | Yes | Assigned only | View | No |
| Execute tests | No | View | View | View | View | View | No | Yes | No |
| Approve release | No | Yes | Optional | Recommend | BA acceptance | Technical approval | No | QA approval | No |
| View audit logs | Yes | Yes | Selected | Project | Project | Project | Own/project | Project | No |
