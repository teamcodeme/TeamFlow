# Pre-Generation Checklist for TeamFlow Backend

Before running `go-duck generate`, verify all prerequisites are in place.

## ✅ Completed Setup

### 1. **Project Module Definition**
- [x] `go.mod` - Created with module `github.com/teamflow/api`
- [x] `go.sum` - Created with initial dependencies

### 2. **Directory Structure**
- [x] `apps/api/` - Backend service root
- [x] `apps/api/cmd/` - Command entry points (ready for generation)
- [x] `apps/api/internal/` - Internal code structure
  - [x] `domain/` - Domain entities (will be generated)
  - [x] `application/` - Application services (will be generated)
  - [x] `infrastructure/` - Infrastructure adapters (will be generated)
  - [x] `ports/` - Port interfaces
- [x] `apps/api/pkg/` - Reusable packages
- [x] `apps/api/migrations/` - Database migrations
- [x] `apps/api/main.go` - Entry point (placeholder)
- [x] `apps/api/README.md` - Documentation

### 3. **Configuration Files**
- [x] `config/go-duck.yaml` - GO-DUCK configuration (pre-configured)
- [x] `blueprints/teamflow-foundation.gdl` - Schema with all entities
- [x] `.env` & `.env.example` - Environment variables
- [x] `.gitignore` - Updated for Go builds and go-duck state

### 4. **Infrastructure**
- [x] `infrastructure/local/compose.yaml` - Docker Compose for PostgreSQL + Keycloak
- [x] `infrastructure/keycloak/` - OIDC configuration
- [x] `database/migrations/` - Migration directory ready

### 5. **Build Automation**
- [x] `Makefile` - With targets for generation and verification
- [x] `scripts/doctor.sh` - Check prerequisites
- [x] `scripts/generate_api.sh` - Run go-duck generation
- [x] `scripts/validate_gdl.sh` - Validate schema
- [x] `scripts/verify_api.sh` - Post-generation verification

### 6. **Documentation**
- [x] `CLAUDE.md` - Engineering rules
- [x] `README.md` - Project overview
- [x] `docs/adr/` - Architecture decision records
- [x] `docs/product/` - Product documentation

## 📋 Pre-Flight Checklist

Before running generation, complete these steps:

### System Requirements
- [ ] Go 1.23+ installed: `go version`
- [ ] git installed: `git version`
- [ ] Docker/Docker Desktop for local dev: `docker version`
- [ ] go-duck CLI installed: `go-duck version`

### Verify Project Setup
```bash
# Check required tools
make doctor

# Validate the GDL schema
make validate-gdl

# Verify Go module
go mod tidy
```

### Configure Environment
```bash
# Copy template and update with your values
cp .env.example .env

# Set these variables:
# - TEAMFLOW_DB_HOST (default: localhost)
# - TEAMFLOW_DB_USER (default: teamflow)
# - TEAMFLOW_DB_PASSWORD
# - TEAMFLOW_DB_NAME (default: teamflow)
# - TEAMFLOW_OIDC_ISSUER (e.g., http://localhost:8081/auth/realms/teamflow)
# - TEAMFLOW_OIDC_CLIENT_ID
# - TEAMFLOW_OIDC_JWKS_URL
```

### Prepare Database
```bash
# Start local PostgreSQL and Keycloak
make db-up

# Verify connectivity (update .env if needed)
```

## 🚀 Generation Command

Once all prerequisites are verified:

```bash
# Option 1: Use the Makefile
make generate-api

# Option 2: Direct go-duck command
go-duck create -o apps/api -c config/go-duck.yaml -g blueprints/teamflow-foundation.gdl
```

This will:
1. Create `apps/api/.go-duck/` state directory
2. Generate domain models from GDL
3. Create repository interfaces
4. Generate HTTP handlers and routes
5. Setup dependency injection
6. Create initial database migration

## ✓ Post-Generation Steps

After generation completes:

```bash
# 1. Format and lint
gofmt -w apps/api/...
go vet ./apps/api/...

# 2. Run tests
go test ./apps/api/...

# 3. Build
go build -o bin/teamflow-api ./apps/api

# 4. Or use make
make verify-api
```

## 📝 Important Notes

- **DO NOT delete `apps/api/.go-duck/`** - Contains generator state needed for incremental updates
- **Preserve GO-DUCK needle comments** - They mark extension points for custom code
- **Commit generated code** - Include all generated files in version control
- **For schema updates:** Use `go-duck import-gdl` instead of `create` after initial generation

## 🔍 Troubleshooting

### "go-duck not found"
```bash
# Install GO-DUCK (see official docs)
# Then verify:
go-duck version
```

### "GDL validation failed"
- Review `blueprints/teamflow-foundation.gdl` for syntax errors
- Check against your GO-DUCK version's GDL syntax

### "Generation failed with flag error"
- Check your GO-DUCK version: `go-duck version`
- Review `scripts/generate_api.sh` - may need flag adjustments
- Run `go-duck create --help` to see available options

### "Database connection failed"
- Ensure PostgreSQL is running: `make db-up`
- Verify environment variables in `.env`
- Check connection details: `echo $TEAMFLOW_DB_HOST`

## 📚 Related Documentation

- [Post-Generation Checklist](./post-generation-checklist.md)
- [Vertical Slice 1 Implementation](./vertical-slice-01.md)
- [Initial Architecture](../architecture/initial-architecture.md)
