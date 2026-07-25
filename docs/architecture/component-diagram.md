# TeamFlow Component Architecture

## Backend Components

```mermaid
flowchart LR
  HTTP[HTTP Transport] --> APP[Application Services]
  APP --> DOMAIN[Domain Model and Policies]
  APP --> PORTS[Repository / External Ports]
  ADAPTERS[PostgreSQL and Storage Adapters] --> PORTS
  APP --> AUDIT[Audit Service]
  APP --> NOTIFY[Notification Service]
```

## Domain Modules

```text
identity
projects
requirements
approvals
clarifications
change_requests
planning
quality
releases
reporting
notifications
audit
```

Each module contains:

```text
domain/       entities, value objects, policies and domain errors
application/  commands, queries and transaction orchestration
repository/   interfaces and PostgreSQL adapters
transport/    HTTP handlers and request mapping
dto/          API request and response contracts
```

## Dependency Rules

1. Domain packages do not import Gin, SQL drivers or HTTP DTOs.
2. Transport calls application services; it does not contain business rules.
3. Application services depend on repository interfaces.
4. PostgreSQL adapters implement repository interfaces.
5. Cross-module writes occur through application services, not direct repository access.
6. Every critical state transition and its audit event share one transaction.

## Cross-Cutting Platform Components

- Configuration and environment validation
- Structured logging and trace IDs
- Authentication and authorization middleware
- Database transaction manager
- Validation and standard API errors
- Clock and identifier providers for deterministic tests
- Attachment security
- Observability and health endpoints

## Requirement Approval Transaction

```mermaid
sequenceDiagram
  participant H as HTTP Handler
  participant A as Approval Service
  participant R as Requirement Repository
  participant D as Database
  H->>A: Approve(versionId, actor)
  A->>R: Load version and reviews
  A->>A: Validate state, permissions and separation of duties
  A->>D: Begin transaction
  A->>R: Mark version APPROVED
  A->>R: Set current approved version
  A->>R: Insert approval record
  A->>R: Insert audit event
  A->>D: Commit
  A-->>H: Approved Version 1.0
```

## Frontend Components

The Angular application uses domain folders with `pages`, `components`, `data-access`, `models`, and route definitions. Signals may hold local feature state; server data remains authoritative.
