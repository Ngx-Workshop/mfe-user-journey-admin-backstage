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
  snackbar feedback; routed components compose design-system action bars/panels and feature views.
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

## Design-system migration — 2026-11-02
List and detail roots opt into ngx-design-system. NgxActionBar replaces the particle
hero/custom action strips. The catalogue uses a 300px filter rail and compact rows;
partial/failed/rate_limited repos appear only in a separate secondary Sync issues
panel. Synced/idle repos remain in Repositories. Existing view/refresh intents and
search/prefix/include-docs inputs still flow through the same scoped list VM/store.
Mobile panel controls keep filters/catalogue/issues accessible within the viewport.

BackstagePanelComponent measures public panel chrome against an allocated workspace
height, owns a keyboard-scrollable body and resets scrolling for changed data.
Viewport helpers clean up observers/listeners on destruction. Detail composes a
repository metadata panel and document panel, with responsive Overview/Documents
controls. Document navigation uses native pressed-state buttons and preserves
DocKind/reload intents; missing documents remain selectable. Metadata and OpenAPI
examples use NgxCodeBlock; Markdown keeps normal Angular sanitization and receives
scoped semantic typography/code styles. Copy/download and JSON-only/disabled-tryout
limits remain intact. Public ngx tokens replace palette fallbacks, and sync/method
statuses use theme-aware accents. All components remain below approximately 230 lines.

Standalone styles include the design-system theme. Federated views inherit the
shell's theme; the existing design-system singleton/package configuration is
retained. No API/store/VM, DTO, route/export, dependency version, persistence or
backend authorization changes accompany the migration.
