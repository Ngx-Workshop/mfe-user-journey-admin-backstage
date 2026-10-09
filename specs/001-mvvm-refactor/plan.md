# Implementation plan — Backstage MVVM

Status: Implemented · Updated: 2026-10-09 · Spec: [spec.md](spec.md)

## Technical Context

**Language/Version**: Angular 21.1.0, TypeScript ~5.9.3
**Primary Dependencies**: Material/CDK, RxJS 7.8.2, marked 12, backstage-contracts 0.0.19
**Storage**: Browser memory; persistence owned by service-backstage
**Project Type**: Federated administrator service catalog remote

## Source baseline and findings

Baseline d87b032; clean working tree. Stateless HTTP already exists. The 315-line
facade combines catalog/detail/docs, subscriptions lack teardown, include toggles
reload twice, same-repo requests race, text documents are assigned as objects,
sync lacks cancellation cleanup and duplicate protection. The OpenAPI component
is 1,053 lines, schema component 433. Generic classes, in-place DTO sorting,
drifting prefix selection and a stale seed title test also need correction.
The live host catalog was observed before implementation.

## Ordered implementation

1. Adapt .specify, optional .github adapters, AGENTS and local context (FR-005).
2. Move feature into src/app/features/backstage and tests into testing/app; retain
   public app routes/exports; add the shared layout checker (FR-004).
3. Replace facade with root catalog/detail stores: switchMap for latest requests,
   per-kind documents canceled on detail changes, exhaustMap for sync, readonly
   signals and lifecycle teardown. Wrap document text in API adapter (FR-001/002).
4. Add scoped list/detail view models for routes, navigation and feedback. Pages
   compose input/output views and contain no data access (FR-001/003).
5. Extract pure OpenAPI/schema projections and focused navigation, operation and
   media views. Convert application classes to BEM; fix DTO mutation, prefix drift,
   unavailable doc tabs and narrow layouts (FR-003/004).
6. Add cancellation/race/recovery/transport/rendering regressions; run tests,
   layout check and build; inspect host and record actual evidence (FR-005).

## Verification and risks

Run npm run check:layout, npm test -- --watch=false --browsers=ChromeHeadless and
npm run build. Validate API paths, refresh/include params, repo encoding, sync body,
same-repo races, document cancellation and tab initialization with deterministic
doubles. Stylesheet conversion and older bundles served by the host need visible
smoke checks. No producer change or delivery ordering is required.

## Constitution Check

All principles mapped above. No hard line-count gate, contract or storage migration.

## Implementation review

The live host initially failed with NG0203 after lifecycle interop was introduced.
The shell already shares @angular/core/rxjs-interop at 21.1.0; this remote now shares
the same entry, resolving the observed injection context failure. Existing exports,
routes and version constraints remain unchanged. The OpenAPI parameter table was
also split into its own view; the main viewer is 224 lines, schema view 207.
Markdown remains 247 lines as a deliberate soft-target exception for cohesive
inline generated-content typography, presentation and local clipboard feedback.
