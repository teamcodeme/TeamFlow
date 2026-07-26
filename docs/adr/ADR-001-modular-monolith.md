# ADR-001: Use a Modular Monolith

**Status:** Accepted

TeamFlow starts as one deployable Go API with domain modules. This keeps approval, version, and audit operations inside one database transaction and avoids premature distributed-system complexity.
