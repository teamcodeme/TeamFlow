# Post-GO-DUCK Generation Checklist

- [ ] Commit `.go-duck/` state.
- [ ] Inspect generated entity and table names.
- [ ] Confirm enum and field type mappings.
- [ ] Confirm relationship foreign keys and required constraints.
- [ ] Confirm generated audit behavior from `@Audited`.
- [ ] Decide whether `TeamFlowAuditEvent` is needed in addition to generated `audit_log`.
- [ ] Disable public update/delete routes for immutable/history entities.
- [ ] Add workflow application services.
- [ ] Add project-scoped authorization middleware/policy.
- [ ] Add optimistic-lock checks.
- [ ] Add PostgreSQL immutability trigger using the actual generated table name.
- [ ] Add transactional approval service.
- [ ] Add explicit workflow endpoints.
- [ ] Add unit and PostgreSQL integration tests.
- [ ] Run gofmt, vet, test, and build.
