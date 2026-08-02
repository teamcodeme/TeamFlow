# Custom Migrations

GO-DUCK should generate normal schema migrations from GDL. Add custom migrations here only after checking generated table names.

Required custom protection after generation:

```sql
CREATE OR REPLACE FUNCTION prevent_approved_requirement_version_update()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'APPROVED' THEN
    RAISE EXCEPTION 'approved requirement versions are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Attach it to the generated RequirementVersion table for UPDATE and DELETE. Include a reversible down migration.
