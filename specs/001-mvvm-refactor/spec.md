# Backstage MVVM refactor

Status: Complete · Created: 2026-10-09

## Requirements

- FR-001: Separate stateless HTTP, singleton server state, scoped view models and views.
- FR-002: Latest search/detail/document intent wins; canceled work cannot overwrite
  newer state. Debounce search, prevent concurrent sync and recover after errors.
- FR-003: Preserve filters/cards, service refresh, sync feedback, detail routes,
  README/OpenAPI/runbook/metadata, operation search/selection, parameters, bodies,
  responses, schema references, copy/download and reload.
- FR-004: Inline HTML/SCSS, BEM classes, focused components near 230 lines and
  feature-first folders. The line target is advisory.
- FR-005: Adapt the local Spec Kit workflow and add meaningful regression coverage.

## Acceptance scenarios

- AC-001: Search/include changes cancel stale catalog loads. Empty/error/401/403 and
  retry are truthful. A toggle issues one load. Refresh updates matching cards.
- AC-002: Navigation/refresh cancels previous detail/doc loads, including same-repo
  refresh races. Missing initial README loads; text responses render as documents.
- AC-003: Sync ignores duplicate clicks, reports result/error and permits retry.
- AC-004: OpenAPI search/selection, request/response/parameter schemas and cyclic
  references work. Markdown remains sanitized; copy/download remain available.
- AC-005: Production build, local tests and layout check pass. Record live host
  checks separately, identifying whether the host serves the changed bundle.

## Boundaries and assumptions

The shell mounts /backstage and owns auth/composition. service-backstage owns
authorization/persistence. Preserve route URLs, federation exports and HTTP DTOs.
No backend changes, package publication or deployment. OpenAPI JSON and disabled
live tryout are inherited behavior; YAML parsing is outside this refactor.

## Constitution Check

All principles apply. Unit doubles do not prove host integration. Keep the soft
component size target subordinate to meaningful responsibility boundaries.
