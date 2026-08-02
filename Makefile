SHELL := /bin/bash
.DEFAULT_GOAL := help

GO_DUCK ?= go-duck
GDL := blueprints/teamflow-foundation.gdl
CONFIG := config/go-duck.yaml
API_DIR := apps/api

.PHONY: help doctor validate-roadmap sync-roadmap enrich-roadmap docs-serve \
	db-up db-down validate-gdl generate-api verify-api clean-api \
	clean dev test build format lint

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "; printf "TeamFlow commands:\n"} /^[a-zA-Z_-]+:.*## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

doctor: ## Check tools needed for the current repository phase
	@./scripts/doctor.sh

validate-roadmap: ## Validate canonical roadmap JSON references and values
	@python3 scripts/validate_roadmap.py

sync-roadmap: ## Copy packages/roadmap-data/roadmap.json into docs/data for the static site
	@python3 scripts/sync_roadmap.py

enrich-roadmap: ## Derive missing start/end dates from dependencies (canonical JSON only)
	@python3 scripts/enrich_roadmap_schedule.py
	@$(MAKE) sync-roadmap

docs-serve: sync-roadmap ## Serve the static documentation site locally on port 4173
	@cd docs && python3 -m http.server 4173

db-up: ## Start local PostgreSQL
	@./scripts/db.sh up

db-down: ## Stop local PostgreSQL
	@./scripts/db.sh down

validate-gdl: ## Validate GDL with installed GO-DUCK CLI
	@./scripts/validate_gdl.sh "$(GO_DUCK)" "$(GDL)"

generate-api: ## Generate API into apps/api
	@./scripts/generate_api.sh "$(GO_DUCK)" "$(CONFIG)" "$(GDL)" "$(API_DIR)"

verify-api: ## Run Go format/vet/test/build for apps/api
	@./scripts/verify_api.sh "$(API_DIR)"

clean-api: ## Refuse automatic API deletion (preserves .go-duck state)
	@echo "Refusing to delete generated API automatically. Preserve apps/api/.go-duck state."
	@exit 1

dev: ## Start application development after apps are scaffolded
	@echo "TODO: scaffold apps/web and apps/api, then wire this target."

test: validate-roadmap ## Run all tests after applications are scaffolded
	@echo "Roadmap validation passed. Application test targets are pending scaffolding."

build: validate-roadmap sync-roadmap ## Build docs data + pending application targets
	@echo "Roadmap data synced for docs deployment. Application build targets are pending scaffolding."

format: ## Format application sources after scaffolding
	@echo "Formatting targets are pending scaffolding."

lint: validate-roadmap ## Lint repository after scaffolding
	@echo "Roadmap validation passed. Application lint targets are pending scaffolding."

clean: ## Remove local generated files
	@rm -rf .local dist coverage
	@rm -f docs/data/roadmap.json
