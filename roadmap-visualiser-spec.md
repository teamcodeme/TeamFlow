# TeamFlow Roadmap Visualiser Specification

## Objective

Create an interactive, content-driven roadmap inspired by roadmap.sh that communicates TeamFlow delivery progress, dependencies and the recommended implementation path. The visualiser belongs to the public documentation site and must not become the operational project-management database.

## Source of Truth

`packages/roadmap-data/roadmap.json` is the canonical roadmap dataset. `packages/roadmap-data/roadmap.schema.ts` defines its TypeScript contract and validation rules. The visualiser must not duplicate node definitions inside components or HTML.

The static documentation site consumes a synced copy at `docs/data/roadmap.json`, produced by `make sync-roadmap` (also run by the Vercel `buildCommand`). Never edit the docs copy by hand.

## Recommended Implementation

- React/Next.js documentation site: `@xyflow/react` and `@dagrejs/dagre`.
- Existing static site: add a small bundled TypeScript application under `docs/roadmap/`, or deploy a separate visualiser and route `/roadmap` to it.
- Load the JSON at build time where possible.
- Run `validateRoadmap()` before rendering.

## Layout

The page contains:

1. Header with overall progress, current phase and next milestone.
2. Search and filters for phase, status, type and owner.
3. Graph canvas with zoom, pan, fit-view and minimap.
4. Details drawer for the selected node.
5. Accessible list fallback for narrow screens and assistive technology.

Graph direction is top-to-bottom. Phases form the primary spine. Features branch from their phase and dependency edges communicate implementation order.

## Node UI

Every node displays title, status text, type and progress when available. Status cannot be communicated through colour alone.

Selecting a node displays description, acceptance criteria, owner, effort, dependencies, child nodes, blocker reason and documentation link.

## Functional Requirements

- RV-FR-001 Load and validate the JSON roadmap.
- RV-FR-002 Render phases, modules, features and milestones as distinct custom nodes.
- RV-FR-003 Render directed dependency edges.
- RV-FR-004 Search title, description and tags.
- RV-FR-005 Filter by phase, status, type and owner.
- RV-FR-006 Select a node and open its details.
- RV-FR-007 Fit the visible graph after filter changes.
- RV-FR-008 Display aggregate completion metrics.
- RV-FR-009 Link nodes to existing documentation.
- RV-FR-010 Provide an accessible non-canvas list view.
- RV-FR-011 Preserve filter state in URL query parameters where practical.
- RV-FR-012 Display validation errors rather than a blank canvas.

## Non-Functional Requirements

- Initial content should render within two seconds on a normal broadband connection.
- The visualiser must be keyboard usable.
- Mobile widths use the list view by default.
- No login, database or external API is required for the MVP.
- The graph must support dark and light themes.
- The implementation must pass lint, type-check and accessibility checks.

## Components

```text
RoadmapPage
├── RoadmapSummary
├── RoadmapFilters
├── RoadmapCanvas
│   ├── PhaseNode
│   ├── ModuleNode
│   ├── FeatureNode
│   └── MilestoneNode
├── RoadmapDetailsDrawer
├── RoadmapLegend
└── RoadmapListFallback
```

## Acceptance Criteria

- All nodes in `roadmap.json` render or appear in the list fallback.
- Missing references fail validation with a useful message.
- Clicking a node shows all supplied details.
- Search and filters update both graph and summary counts.
- Documentation links open the correct TeamFlow page.
- Completed, in-progress, planned and blocked states are distinguishable without relying only on colour.
- The visualiser works at 320px width without page-level horizontal overflow.
