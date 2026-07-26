SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help doctor validate-roadmap sync-roadmap docs-serve clean dev test build format lint

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "; printf "TeamFlow commands:\n"} /^[a-zA-Z_-]+:.*## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

doctor: ## Check tools needed for the current repository phase
	@command -v python3 >/dev/null || (echo "python3 is required" && exit 1)
	@command -v git >/dev/null || (echo "git is required" && exit 1)
	@echo "Foundation tooling is available."

validate-roadmap: ## Validate canonical roadmap JSON references and values
	@python3 scripts/validate_roadmap.py

sync-roadmap: ## Copy packages/roadmap-data/roadmap.json into docs/data for the static site
	@mkdir -p docs/data
	@cp packages/roadmap-data/roadmap.json docs/data/roadmap.json
	@echo "Synced docs/data/roadmap.json from packages/roadmap-data/roadmap.json"

docs-serve: sync-roadmap ## Serve the static documentation site locally on port 4173
	@cd docs && python3 -m http.server 4173

dev: ## Start application development after apps are scaffolded
	@echo "TODO: scaffold apps/web and apps/api, then wire this target."

test: validate-roadmap ## Run all tests after applications are scaffolded
	@echo "Roadmap validation passed. Application test targets are pending scaffolding."

build: validate-roadmap sync-roadmap ## Build applications after scaffolding
	@echo "Roadmap data synced for docs deployment. Application build targets are pending scaffolding."

format: ## Format application sources after scaffolding
	@echo "Formatting targets are pending scaffolding."

lint: validate-roadmap ## Lint repository after scaffolding
	@echo "Roadmap validation passed. Application lint targets are pending scaffolding."

clean: ## Remove local generated files
	@rm -rf .local dist coverage
	@rm -f docs/data/roadmap.json
