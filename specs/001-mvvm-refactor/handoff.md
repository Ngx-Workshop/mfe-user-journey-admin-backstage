# Handoff — Backstage MVVM refactor

Status: Complete · Updated: 2026-10-09
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior

- Adapted document editor .specify workflow/templates/helpers and .github adapters
  to Backstage; added local AGENTS, constitution/context and feature artifacts.
- Moved domain code to src/app/features/backstage and tests to testing/app.
- Stateless HTTP client maps text documents correctly without inventing metadata
  or labeling non-JSON metadata as JSON.
- Separate root catalog/detail stores own requests, cancellation, readonly state,
  per-repo refresh and duplicate-sync protection. Scoped page view models own
  route teardown, navigation and feedback.
- Removed duplicate include-doc loads, stale same-repo detail/doc races, input DTO
  mutation, prefix selection drift and stale seed tests. Missing document tabs
  can fetch/retry; missing initial README loads automatically.
- Split OpenAPI into navigation, operation, parameter, media and method views;
  schema traversal and OpenAPI parsing/grouping/filtering are pure utilities.
  Operation-level parameters override inherited parameters by name/location.
- Inline templates/SCSS, OnPush, BEM and narrow catalog grid. Main OpenAPI viewer
  224 lines, schema 207. Markdown 247 is a deliberate soft-target exception.

## Verification evidence

| Check | Result | Scope/limit |
| --- | --- | --- |
| npm run check:layout | PASS | Feature-first source and mirrored tests |
| npm test -- --watch=false --browsers=ChromeHeadless | PASS: 25 tests | API transport, catalog/detail races, failures/retry, exclusive sync, route teardown, rendering, schema cycles, Markdown sanitization, clipboard/download and DTO immutability |
| npm run build | PASS | Production bundle, strict templates and style budgets |
| git diff --check | PASS | Tracked changes whitespace |
| Host catalog | PASS | Refactored BEM header confirmed through DOM; search service-backstage leaves one card |
| Host detail/README | PASS | View details navigates to /backstage/details/service-backstage; rendered README and metadata |
| Host OpenAPI | PASS | Seven operations; search sync selects POST /sync; request/response schemas and required properties visible |
| Host missing metadata | PASS | Tab is selectable; missing document shows error and Reload |
| Backend sync/forced refresh | UNIT-VERIFIED | No live mutation during smoke checks; deterministic doubles cover concurrency and failure recovery |
| Access denial/race paths | UNIT-VERIFIED | Not induced in live backend |

The host smoke test found an NG0203 integration failure from an unshared Angular
interop entry. Matching the shell's @angular/core/rxjs-interop singleton 21.1.0
resolved it; the rebuilt catalog then rendered. The browser confirmed the changed
BEM class, not an older bundle. Tests intentionally trigger an Angular HTML
sanitization warning to verify malicious Markdown is stripped.

## Contracts and next action

No backend or shell implementation change, package publication or deployment is
required. Existing host routes, default App, named Routes, federation name/exports,
HTTP paths/DTO versions and existing singleton constraints are preserved. Only the
matching interop shared entry was added. The user's existing static server was reused.

No required implementation tasks remain. OpenAPI YAML parsing and live tryout remain
outside scope. Wider shared Material/CDK duplication warnings may occur and should
be coordinated across shell/remotes if addressed. All changes remain uncommitted
for review. README and docs/architecture, development, API contracts, source
organization, adoption and readiness were updated.
