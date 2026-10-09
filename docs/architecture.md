# Backstage architecture

This Angular 21.1 standalone, zoneless remote owns the administrator repository
catalog and read-only service documentation explorer. The shell owns composition,
theme and authentication context; service-backstage owns persistence, sync and
authorization. Dependencies and shared federation versions stay compatible.

## Runtime and contracts

main.ts imports bootstrap.ts; App's default export contains the router outlet.
app.routes.ts exports named Routes with '', list, details/:repo and wildcard.
The host mounts them at /backstage.
Angular core/rxjs-interop is explicitly shared as a 21.1.0 singleton, matching the
shell; otherwise lifecycle helpers can use a second Angular injection context. webpack.config.js retains the inherited
ngx-seed-mfe federation name, remoteEntry.js and ./Component / ./Routes exposures.

## Source and ownership

All domain code lives under src/app/features/backstage:

- api/backstage-api-client.service.ts: stateless HTTP; relative /api prefix,
  repo path encoding and raw document text → DocBlobDto adaptation.
- state/backstage-catalog.store.ts: root singleton catalog, debounced search,
  include-docs, latest list requests, independent per-repo refresh and exclusive sync.
- state/backstage-detail.store.ts: root singleton selection/detail/docs. Latest
  detail and per-kind requests win; changing detail cancels all documents first.
  Leaving the detail route clears state. Missing initial README loads automatically.
- models: published DTO-facing state and OpenAPI/schema types.
- pages: scoped list/detail view models handle route lifecycle, navigation and
  snackbar feedback; routed components compose Material/header and feature views.
- components: input/output filters/cards/results/tabs/errors; document viewers
  include local clipboard/download actions. OpenAPI viewer orchestrates local
  projection/search/selection and composes navigation, operation, method and media
  views. Schema rendering is recursive with a pure traversal projection.
- utils: OpenAPI parse/group/filter/content mapping, schema traversal and formatting.

Stores use RxJS for asynchronous commands and cancellation, exposing readonly
signal state. Presentation never injects stores or HTTP. All subscriptions are
bounded by their injection lifetime; route subscriptions end with their page VM.
Components keep HTML/SCSS inline, use BEM and OnPush. Markdown's generated content
uses a scoped ::ng-deep selector and Angular's normal HTML sanitization.

## Compatibility limits

OpenAPI is JSON-only; live tryout stays disabled. Schema rendering supports
component refs, arrays, required properties, compositions and cycle detection.
The parameter table is a separate focused view.
Missing runbook/metadata tabs are selectable, so retrieval and retry are possible.
No transport/DTO producer changes, storage migration or federation change.
