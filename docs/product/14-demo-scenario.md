# TeamFlow CTO Demo Scenario

## 1. Demo Objective

The demonstration must show that TeamFlow controls requirement changes without preventing valid business decisions.

The demo should focus on one realistic scenario and take approximately 10 to 12 minutes.

## 2. Demo Project

Project:

```text
Regional Warehouse Management
```

Project code:

```text
RWM
```

## 3. Demo Users

- Aisha — Business Analyst
- Nimal — Project Manager
- Farhan — Technical Lead
- Devika — Developer
- Rizwan — QA Engineer
- CTO Demo User — CTO
- Management Demo User — Management

## 4. Initial Requirement

Requirement number:

```text
REQ-RWM-0001
```

Title:

```text
Restrict regional staff to assigned warehouses
```

Business objective:

```text
Ensure that regional staff can access only warehouses assigned to them.
```

Initial business rule:

```text
One regional staff member can be assigned to one warehouse.
```

Acceptance criterion:

```text
Given a regional staff member is assigned to Warehouse A,
when the user logs into the system,
then only Warehouse A is displayed.
```

## 5. Demo Preparation

The demo reset script must:

1. Reset the demo database.
2. Create all demo users.
3. Create the RWM project.
4. Add project members.
5. Create REQ-RWM-0001.
6. Create Version 1.0.
7. Add review history.
8. Prepare sample tasks.
9. Prepare sample tests.
10. Prepare dashboard baseline.

Commands:

```bash
make demo-reset
make demo-start
```

## 6. Scene 1 — BA Creates Requirement

Log in as Aisha.

Show:

- Structured requirement form
- Business objective
- Workflow
- Business rules
- Acceptance criteria
- Out-of-scope items
- Attachment area
- Definition of Ready checklist

Submit the requirement.

Key message:

> TeamFlow requires enough information before development begins.

## 7. Scene 2 — PM and Technical Review

Log in as Nimal.

Show:

- Requirement review page
- Delivery dependency
- Priority
- Target sprint
- PM review comment

Log in as Farhan.

Show:

- Technical review
- Feasibility
- Backend impact
- Authorization notes
- Technical approval

Log in as Rizwan.

Show:

- QA review
- Testability
- Edge-case note
- QA approval

## 8. Scene 3 — Requirement Approval and Lock

Approve Version 1.0.

Show:

```text
APPROVED
VERSION 1.0
LOCKED
```

Open the version history.

Show:

- Author
- Reviewers
- Approval dates
- Requirement snapshot
- Audit events

Key message:

> Version 1.0 is now the official source of truth.

## 9. Scene 4 — Development Planning

Log in as Nimal.

Create or show tasks:

- Backend warehouse authorization filter
- Frontend warehouse list restriction
- Database assignment validation
- QA access-control test suite

Each task must display:

```text
Linked Requirement: REQ-RWM-0001
Version: 1.0
```

## 10. Scene 5 — BA Requests a Change

Log in as Aisha.

Attempt to edit the approved business rule.

The system must show:

```text
Approved requirement versions cannot be edited.
Create a change request to propose a modification.
```

Create change request:

```text
CR-RWM-0001
```

Requested change:

```text
One regional staff member may be assigned to up to two warehouses.
```

Business reason:

```text
Some regional officers provide operational coverage for two nearby warehouses.
```

Key message:

> TeamFlow allows the change, but it does not erase the original decision.

## 11. Scene 6 — Impact Analysis

Log in as Farhan.

Add technical impact:

- Frontend: 8 hours
- Backend: 12 hours
- Database: 2 hours
- Rework: 4 hours
- Risk: Medium
- Migration: Not required

Log in as Rizwan.

Add QA impact:

- QA: 6 hours
- Existing tests affected: 6
- Regression required: Yes

Log in as Nimal.

Add project impact:

- Delivery delay: 2 days
- Affected sprint: Sprint 4
- Recommendation: Approve with revised date

Show total:

```text
Total estimated impact: 32 hours
Delivery impact: 2 working days
```

## 12. Scene 7 — CTO Decision

Log in as CTO Demo User.

Show:

- Original version
- Requested change
- Field-level comparison
- Technical impact
- QA impact
- PM recommendation
- Risk
- Delivery delay

Approve for current sprint.

Mandatory reason:

```text
Operational need justifies the two-day delivery adjustment.
```

## 13. Scene 8 — New Version

Show that TeamFlow creates:

```text
Version 2.0 — DRAFT
Based on Version 1.0
Created by CR-RWM-0001
```

Complete review and approval.

Show both versions:

- Version 1.0 remains unchanged.
- Version 2.0 becomes current approved version.
- Change request remains linked.

## 14. Scene 9 — QA Traceability

Open linked test cases.

Show:

```text
REVIEW_REQUIRED
```

Reason:

```text
Linked requirement changed from Version 1.0 to Version 2.0.
```

Update the test:

```text
Given a regional staff member is assigned to Warehouse A and Warehouse B,
when the user logs in,
then only Warehouse A and Warehouse B are displayed.
```

Execute and pass the test.

## 15. Scene 10 — Management Dashboard

Show:

- Approved requirements: 1
- Post-approval changes: 1
- Rework: 4 hours
- Total change effort: 32 hours
- QA retesting: 6 hours
- Delivery impact: 2 days
- Affected tasks: 4
- Affected tests: 6
- Change decision: Approved by CTO

Key message:

> Management can now see why the delivery changed and who approved the revised plan.

## 16. Closing Statement

Use:

> TeamFlow does not prevent Business Analysts or management from changing a requirement. It ensures that the change is visible, its impact is understood, the correct people approve it, and development and QA work against the same version.

## 17. Pilot Request

Request:

- One active project
- One BA
- One PM
- Two developers
- One QA Engineer
- One Technical Lead
- Four-week pilot

## 18. Demo Failure Protection

Before the meeting:

- Run the full E2E demo test.
- Reset demo data.
- Verify all demo accounts.
- Keep screenshots as backup.
- Keep a short recorded demo as backup.
- Avoid depending on external AI APIs.
- Avoid live code changes.
- Use stable seeded data.
