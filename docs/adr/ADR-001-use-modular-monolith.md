# Use a Modular Monolith

- Status: Accepted
- Date: 2026-07-24

## Context

TeamFlow contains closely connected transactional workflows.

## Decision

Implement one Go API organised into strongly bounded domain modules.

## Consequences

Simpler transactions, deployment and debugging; modules can be extracted later when evidence justifies it.

## Alternatives Considered

Starting with microservices would increase operational and consistency complexity before the product has proven load or team boundaries.

## Review Trigger

Review this decision when pilot evidence demonstrates that the assumptions no longer hold.
