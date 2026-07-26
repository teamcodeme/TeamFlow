SHELL := /bin/bash
GO_DUCK ?= go-duck
GDL := blueprints/teamflow-foundation.gdl
CONFIG := config/go-duck.yaml
API_DIR := apps/api

.PHONY: help doctor db-up db-down validate-gdl generate-api verify-api clean-api

help:
	@echo "TeamFlow GO-DUCK starter"
	@echo "  make doctor        Check required tools"
	@echo "  make db-up         Start local PostgreSQL"
	@echo "  make db-down       Stop local PostgreSQL"
	@echo "  make validate-gdl  Validate GDL with installed GO-DUCK CLI"
	@echo "  make generate-api  Generate API into apps/api"
	@echo "  make verify-api    Run Go format/vet/test/build"

doctor:
	@./scripts/doctor.sh

db-up:
	@./scripts/db.sh up

db-down:
	@./scripts/db.sh down

validate-gdl:
	@./scripts/validate_gdl.sh "$(GO_DUCK)" "$(GDL)"

generate-api:
	@./scripts/generate_api.sh "$(GO_DUCK)" "$(CONFIG)" "$(GDL)" "$(API_DIR)"

verify-api:
	@./scripts/verify_api.sh "$(API_DIR)"

clean-api:
	@echo "Refusing to delete generated API automatically. Preserve apps/api/.go-duck state."
	@exit 1
