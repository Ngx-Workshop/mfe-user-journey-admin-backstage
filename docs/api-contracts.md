# API contracts

Source of truth: @tmdjr/backstage-contracts 0.0.19 and the HTTP adapter.
The remote calls same-origin /api/backstage; the gateway owns backend routing.

| Request | Response | Mapping |
| --- | --- | --- |
| GET /api/backstage/services | ServiceSummaryDto[] | q trimmed; optional comma-separated include; refresh flag |
| GET /api/backstage/services/:repo | ServiceDetailDto | encoded repo; optional refresh |
| POST /api/backstage/sync | SyncResponseDto | unchanged SyncRequestDto; empty object means all |
| GET /api/backstage/services/:repo/readme | text | content + markdown format |
| GET /api/backstage/services/:repo/openapi | text | content + json format if parseable; otherwise raw |
| GET /api/backstage/services/:repo/runbook | text | content + markdown format |
| GET /api/backstage/services/:repo/metadata | text | content + json format if parseable; otherwise raw |

Text document responses carry no SHA/fetchedAt metadata; do not invent it. Embedded
detail docs retain their published metadata. Metadata lives on serviceMetadata.
401/403 map to an access-denied state; other failures retain a recovery action.
Authorization remains on service-backstage. openapi.json is an inherited snapshot;
this refactor does not regenerate/publish contracts or claim YAML support.
