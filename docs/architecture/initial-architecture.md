# Initial TeamFlow Architecture

## Style

Use a modular monolith for the first release.

```text
Angular Web (future)
       │ HTTPS/REST
       ▼
GO-DUCK-generated Go API
       │
       ├── Identity and project access
       ├── Requirements and versions
       ├── Reviews and approvals
       └── Audit history
       │
       ▼
PostgreSQL
```

## Initial domains

- identity
- projects
- requirements
- approvals
- audit

## Transaction boundary

Final approval must atomically:

1. Lock the candidate requirement version.
2. Validate project membership and role.
3. Validate required reviews.
4. Calculate the immutable snapshot hash.
5. Mark the version approved.
6. Set the requirement's current approved version.
7. Append the final approval record.
8. Append the audit record.
9. Commit.

Any failure must roll back all steps.
