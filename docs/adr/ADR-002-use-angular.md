# Use Angular for the Secure Web Application

- Status: Accepted
- Date: 2026-07-24

## Context

The product is an enterprise workflow application with complex forms, role-based navigation and long-term internal maintenance.

## Decision

Use modern standalone Angular, TypeScript, Signals, Reactive Forms and Angular Material/Tailwind integration.

## Consequences

Strong structure and testing conventions; the team must keep feature boundaries and avoid oversized components.

## Alternatives Considered

React was considered but Angular better matches the intended enterprise application conventions and existing experience.

## Review Trigger

Review this decision when pilot evidence demonstrates that the assumptions no longer hold.
