# Tasks — Backstage MVVM

Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Updated: 2026-10-09

- [x] T001 Adapt workflow/context and document audit/design (FR-005).
- [x] T002 Move source/tests and add layout check (FR-004); verify check:layout.
- [x] T003 Implement API/stores/models and page view models (FR-001/002); AC-001–003.
- [x] T004 Split viewers/projections and inline BEM views (FR-003/004); AC-004.
- [x] T005 Complete regression suite and production build (FR-005); AC-005.
- [x] T006 Update context/handoff; record host smoke evidence and remaining limits.

## Constitution Check

All principles apply. No external implementation required. Only check tasks after
their result has evidence; distinguish local checks from host integration.

## Evidence

- T001: Local workflow, Backstage constitution/context/templates and optional adapters.
- T002: Feature-first source and mirrored tests; check:layout passes.
- T003: API/store/route regressions cover cancellation, races, recovery and sync.
- T004: Rendering tests cover operations, schemas, prefix state, sanitization,
  immutable DTO projection and copy/download; production templates compile.
- T005: 25 ChromeHeadless tests pass; production build and diff checks pass.
- T006: Host verified BEM catalog, filter, details/README, OpenAPI search/schema
  and missing metadata recovery. No backend mutation was needed for smoke checks.
