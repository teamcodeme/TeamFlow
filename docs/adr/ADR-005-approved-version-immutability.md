# ADR-005: Approved Requirement Versions Are Immutable

**Status:** Accepted

Approved versions cannot be updated or deleted. Enforcement occurs in the domain/application service, repository query, and PostgreSQL trigger. Later changes create a new version.
