# TeamFlow Security Model

## 1. Security Objectives

TeamFlow must protect:

- Requirements
- Requirement history
- Approvals
- Change decisions
- Project membership
- Development tasks
- QA evidence
- Defects
- Release decisions
- Audit records
- User accounts
- Attachments

The security model must prevent unauthorized access, unauthorized modification, silent history rewriting, privilege escalation, and cross-project data exposure.

## 2. Security Principles

- Least privilege
- Deny by default
- Backend authorization
- Separation of duties
- Immutable approved records
- Append-only audit history
- Secure defaults
- Defense in depth
- Explicit project scope
- Traceable administrative actions

## 3. Authentication

The MVP may use:

- Built-in username/password with JWT, or
- Keycloak using OpenID Connect

Production recommendation:

- OpenID Connect
- Short-lived access tokens
- Refresh token rotation where supported
- Multi-factor authentication for privileged roles
- Account lockout or throttling
- Secure password reset

## 4. Password Security

When built-in authentication is used:

- Passwords must never be stored in plain text.
- Use Argon2id or bcrypt with approved parameters.
- Enforce minimum password length.
- Prevent common weak passwords.
- Rate-limit login attempts.
- Record failed attempts.
- Never log passwords.

## 5. Authorization Model

Authorization combines:

- Global role
- Project membership
- Project role
- Resource ownership where applicable
- Workflow state
- Separation-of-duty rules

Example decision:

```text
Can user approve requirement version?
  ├── Is user authenticated?
  ├── Is user active?
  ├── Is user a member of the project?
  ├── Does user hold required review permission?
  ├── Is version in correct status?
  ├── Has user authored the version?
  └── Does policy allow self-approval?
```

## 6. Project Isolation

Every project-owned query must apply project authorization.

The system must prevent:

- Changing project IDs in URLs to view another project
- Accessing attachments from another project
- Exporting unauthorized project data
- Viewing audit records outside allowed scope

## 7. Requirement Immutability

Approved RequirementVersion records must be protected by:

- Domain service validation
- Repository validation
- Database-level protection where practical
- API transition rules
- Audit verification

A direct update attempt must return:

```text
409 CONFLICT
REQUIREMENT_VERSION_IMMUTABLE
```

## 8. Separation of Duties

Default controls:

- Requirement author cannot provide final approval where prohibited.
- Developer cannot provide QA verification for own implementation.
- Change requester cannot provide final high-impact approval.
- System administrator cannot use admin role as business approval.
- Management override requires a reason.
- Release approval may require multiple roles.

## 9. Audit Security

Audit records must:

- Be append-only.
- Include actor, action, entity, timestamp, and trace ID.
- Record old and new values where appropriate.
- Be protected from normal deletion.
- Have restricted read access.
- Avoid unnecessary secrets or personal data.

Optional later enhancement:

```text
eventHash = SHA-256(previousHash + canonicalEventPayload)
```

This creates tamper-evident chaining.

## 10. Input Validation

The backend must validate:

- Required values
- Length limits
- Enum values
- UUIDs
- Date ranges
- File metadata
- Status transitions
- Numeric boundaries
- Project ownership
- Relationship consistency

Validation must not rely only on Angular forms.

## 11. Injection Protection

- Use parameterized SQL.
- Avoid dynamic SQL from user input.
- Encode output.
- Sanitize rich text.
- Validate file names.
- Protect log statements from injection.
- Avoid shell command construction from user input.

## 12. Cross-Site Scripting

- Escape user-generated content by default.
- Use a restricted rich-text format if required.
- Sanitize HTML on input and output.
- Apply Content Security Policy.
- Do not use unsafe Angular bypass methods without security review.

## 13. CSRF

If cookie-based authentication is used:

- Use SameSite cookies.
- Implement CSRF tokens.
- Validate origin where appropriate.

If bearer tokens are used:

- Avoid storing long-lived tokens in insecure browser storage.
- Use a secure token strategy.

## 14. File Upload Security

The system must:

- Restrict allowed file types.
- Restrict maximum size.
- Generate storage keys instead of trusting file names.
- Scan files for malware where infrastructure permits.
- Store files outside the web root.
- Validate project authorization during download.
- Record checksum.
- Prevent executable upload.
- Log upload and download actions where required.

## 15. API Security

- Use TLS.
- Apply rate limits.
- Validate content type.
- Limit request size.
- Return controlled errors.
- Avoid stack traces in production responses.
- Use correlation IDs.
- Apply pagination limits.
- Protect export endpoints.
- Apply idempotency to high-value actions.

## 16. Secret Management

Secrets include:

- Database credentials
- JWT signing keys
- OIDC client secrets
- Storage credentials
- SMTP credentials
- API keys

Secrets must:

- Be stored outside source control.
- Be injected through environment or secret management.
- Be rotated.
- Not appear in logs.
- Not appear in frontend builds.

## 17. Logging Security

Logs must not contain:

- Passwords
- Access tokens
- Refresh tokens
- Session cookies
- Full secret values
- Sensitive attachment content
- Unnecessary personal information

## 18. Data Protection

- Encrypt data in transit.
- Use encrypted storage where available.
- Restrict database access.
- Apply backups and restore testing.
- Define retention periods.
- Apply least privilege to database users.

## 19. Threat Scenarios

The test plan must include:

- User changes project ID in URL.
- Developer attempts to approve own task and QA result.
- BA attempts direct update of approved version.
- User replays approval request.
- User uploads executable file.
- User exports another project’s data.
- User changes role through API.
- Concurrent users create competing versions.
- Administrator attempts business approval.
- Audit record deletion is attempted.
- Stored XSS is inserted into requirement comments.
- SQL injection payload is submitted through filters.

## 20. Security Incident Support

The system should provide:

- Trace IDs
- Security audit events
- User session visibility
- Account lock function
- Token revocation where supported
- Exportable incident evidence
- Controlled administrative access

## 21. Security Acceptance Criteria

Before pilot:

- No known critical vulnerability remains.
- Broken object-level authorization tests pass.
- Approved requirement immutability tests pass.
- Role escalation tests pass.
- Sensitive logs are reviewed.
- Dependency scanning is enabled.
- Restore procedure is tested.
- Security configuration is documented.
