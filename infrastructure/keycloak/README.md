# Keycloak Setup

Create realm:

```text
teamflow
```

Create API client:

```text
teamflow-api
```

Initial realm roles:

```text
TEAMFLOW_SYSTEM_ADMIN
TEAMFLOW_CTO
TEAMFLOW_MANAGEMENT
TEAMFLOW_PROJECT_MANAGER
TEAMFLOW_BUSINESS_ANALYST
TEAMFLOW_TECHNICAL_LEAD
TEAMFLOW_DEVELOPER
TEAMFLOW_QA_ENGINEER
TEAMFLOW_VIEWER
```

Realm roles provide broad capability. Every project operation must also validate an active ProjectMember record for the target project.
