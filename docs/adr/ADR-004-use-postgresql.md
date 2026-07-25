# Use PostgreSQL as the Primary Database

- Status: Accepted
- Date: 2026-07-24

## Context

The domain has relational integrity, workflow constraints, reporting and transactional versioning requirements.

## Decision

Use PostgreSQL with version-controlled migrations and explicit transactions.

## Consequences

Strong constraints, JSON support and reporting; schema changes require disciplined migrations.

## Alternatives Considered

Document databases would weaken relational constraints. Multiple databases are unnecessary for the MVP.

## Review Trigger

Review this decision when pilot evidence demonstrates that the assumptions no longer hold.
