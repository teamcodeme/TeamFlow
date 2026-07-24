# TeamFlow Requirement Workflow

## 1. Objective

The requirement workflow ensures that software work begins only after the requirement is sufficiently complete, reviewed, approved, and assigned a specific version.

## 2. Requirement Lifecycle

```text
DRAFT
  ↓
SUBMITTED
  ↓
UNDER_BA_REVIEW
  ↓
UNDER_PM_REVIEW
  ↓
UNDER_TECHNICAL_REVIEW
  ↓
UNDER_QA_REVIEW
  ↓
APPROVED
  ↓
IN_DEVELOPMENT
  ↓
IMPLEMENTED
  ↓
QA_VERIFIED
  ↓
BA_ACCEPTED
  ↓
RELEASED
```

Alternative states:

```text
CHANGES_REQUESTED
REJECTED
ON_HOLD
CANCELLED
SUPERSEDED
```

## 3. Requirement Creation

A Business Analyst creates a requirement in DRAFT status.

Mandatory information:

- Project
- Requirement title
- Business objective
- Detailed description
- Actor or user role
- Main workflow
- Business rules
- Acceptance criteria
- Priority
- Author
- Creation date

Conditionally mandatory information:

- UI references
- Integration details
- Dependencies
- Data migration requirements
- Security considerations
- Attachments
- Alternative workflows
- Out-of-scope items

## 4. Draft Editing

While a requirement is in DRAFT:

- The author may edit it.
- Assigned collaborators may comment.
- Validation warnings may be displayed.
- No development task should be marked READY unless the requirement is approved.
- Draft changes must still be recorded in normal history.

## 5. Submission

When the BA submits the requirement:

1. The system validates required fields.
2. The system checks the Definition of Ready.
3. The system assigns a review workflow.
4. The requirement becomes SUBMITTED.
5. Reviewers receive notifications.
6. The author can no longer make unrestricted edits.

If validation fails, the requirement remains DRAFT.

## 6. BA Review

The BA reviewer verifies:

- Business problem is clear.
- Objective is measurable.
- Actors are correct.
- Workflows are complete.
- Business rules are consistent.
- Acceptance criteria are testable.
- Assumptions are visible.
- Out-of-scope items are recorded.

Possible decisions:

- Approve BA review
- Request changes
- Reject
- Put on hold

## 7. PM Review

The Project Manager verifies:

- Priority is clear.
- Target release is realistic.
- Dependencies are identified.
- Scope boundaries are clear.
- Required stakeholders are identified.
- Planning information is sufficient.
- Delivery constraints are recorded.

The PM may request changes but cannot silently rewrite the requirement.

## 8. Technical Review

The Technical Lead verifies:

- Technical feasibility
- Architecture impact
- Integration impact
- Database impact
- Security impact
- Performance considerations
- Migration needs
- Technical dependencies
- Development estimate readiness

Technical review comments become part of the permanent review history.

## 9. QA Review

QA verifies:

- Acceptance criteria are testable.
- Expected results are unambiguous.
- Edge cases are identified.
- Required test data is available.
- Non-functional requirements are testable.
- Dependencies on external environments are visible.

QA may request clarification before approval.

## 10. Approval

After all mandatory reviews pass:

1. The system assigns the next version number.
2. The requirement version becomes APPROVED.
3. The version is locked.
4. An immutable snapshot is stored.
5. Approval records are stored.
6. Audit events are created.
7. Planning tasks may be activated.
8. The approved version becomes the current source of truth.

## 11. Immutability Rule

An approved requirement version cannot be edited through:

- User interface
- Public API
- Bulk update
- Import
- Administrator screen
- Background process

Any change must create:

- A change request
- A new draft requirement version
- A reason for change
- A version relationship to the approved version

## 12. Development Transition

The requirement may enter IN_DEVELOPMENT when:

- At least one task is linked.
- Required approvals are complete.
- No blocking clarification remains.
- The PM assigns the work to a sprint or delivery plan.

## 13. Implementation Completion

A requirement may become IMPLEMENTED when:

- All mandatory linked development tasks are DONE.
- Required code review is complete.
- Technical notes are available.
- No unresolved critical blocker remains.

## 14. QA Verification

A requirement becomes QA_VERIFIED when:

- Required test cases have executed.
- Mandatory tests pass.
- No unresolved critical defect remains.
- QA records verification.

## 15. BA Acceptance

A requirement becomes BA_ACCEPTED when the BA confirms that the delivered implementation satisfies the approved version.

If the BA identifies a new expectation not included in the approved requirement, it must be recorded as a change request rather than an implementation defect.

## 16. Release

The requirement becomes RELEASED when:

- It is included in an approved release.
- Release approval is complete.
- Deployment is confirmed.
- Post-deployment verification is complete where required.

## 17. Clarifications

A clarification may be raised at any point before release.

Clarification fields:

- Question
- Asked by
- Assigned to
- Due date
- Requirement version
- Response
- Resolution
- Decision status
- Confirmed by
- Confirmed date

A clarification becomes an official project decision only after confirmation by an authorized role.

## 18. Version Numbering

Recommended rules:

- Version 1.0: First approved version
- Version 1.1: Minor clarification with limited scope impact
- Version 2.0: Major workflow, rule, scope, or acceptance change

The system may suggest the version type, but the authorized reviewer confirms it.

## 19. Definition of Ready

A requirement cannot be approved until:

- Business objective is provided.
- Actors are identified.
- Workflow is documented.
- Acceptance criteria are present.
- Business rules are complete.
- Dependencies are identified.
- Out-of-scope items are recorded.
- Technical review is complete.
- QA review is complete.
- Required attachments are available.
- Blocking clarifications are resolved.

## 20. Workflow Audit Requirements

The system must preserve:

- Previous status
- New status
- Changed by
- Changed date
- Review comment
- Approval or rejection reason
- Requirement snapshot
- Version identifier
- Related change request
- Trace ID
