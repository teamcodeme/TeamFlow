# Use Go for the Backend API

- Status: Accepted
- Date: 2026-07-24

## Context

TeamFlow needs a low-memory, testable API with simple deployment.

## Decision

Use Go with Gin for HTTP, explicit modular packages and PostgreSQL repositories.

## Consequences

Produces a compact service and clear concurrency model; additional domain structure must be deliberately maintained.

## Alternatives Considered

Java/Spring is heavier for the targeted deployment. Python is productive but Go better matches the desired runtime footprint.

## Review Trigger

Review this decision when pilot evidence demonstrates that the assumptions no longer hold.
