# Approved Requirement Versions Are Immutable

- Status: Accepted
- Date: 2026-07-24

## Context

Silent edits to approved requirements are the main business problem TeamFlow exists to solve.

## Decision

Prevent updates to approved RequirementVersion records in domain services, repositories and a PostgreSQL guard/trigger. Changes require a change request and new version.

## Consequences

History remains trustworthy and measurable. Corrections require controlled versioning rather than direct updates.

## Alternatives Considered

Application-only validation is insufficient because imports or direct persistence access could bypass it.

## Review Trigger

Review this decision when pilot evidence demonstrates that the assumptions no longer hold.
