# Backstage design-system migration
Status: Complete
Created: 2026-11-02

## Scope and acceptance
Migrate the repository catalogue and read-only documentation explorer using the
installed design-system 21.0.10 and established admin workspace layout.
- FR-001 / AC-001: Shared action bars replace particle headers. Catalogue has a
  filter rail, compact repository rows and separate partial/failed/rate-limited
  sync issues, all internally scrolling above the fold. Mobile switches panels.
- FR-002 / AC-002: Search/prefix/include-docs, list retry/access denial, per-repo
  refresh, sync-all and details navigation preserve existing contracts/intents.
- FR-003 / AC-003: Detail uses bounded repository metadata/document panels, themed
  document navigation and JSON/example code blocks. Missing documents stay
  selectable/reloadable; Markdown remains sanitized, copy/download remain intact.
- FR-004 / AC-004: Theme inheritance and standalone fallback, useful labels,
  keyboard navigation, loading/error/empty and responsive bounds are verified.

## Boundaries and success
No route/export/federation, API/DTO, store cancellation, backend/data, permissions,
publication or deployment changes. Keep MVVM/OnPush/inline BEM views, mirror tests.
Check layout, strict types, Karma, isolated production build and read-only shell
smoke. Sync/refresh writes are tested with doubles, not invoked on live repos merely
for visual verification. OpenAPI remains JSON-only and live tryout disabled.
