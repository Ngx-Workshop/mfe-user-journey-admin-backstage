# Backstage design-system handoff
Status: Complete
Updated: 2026-11-02
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered
Shared action bars, semantic statuses/buttons, theme fallback and full-width bounded
workspaces replace particle headers and unbounded cards. Catalogue has a filter
rail, compact repository rows and separate sync issues (partial/failed/rate-limited,
without duplication). Detail has metadata/document panels and responsive navigation.
Native document selectors retain missing-document access/reload. Structured metadata
and OpenAPI examples use shared code blocks; Markdown remains sanitized. Existing
repository actions, form controls, copy/download and OpenAPI limits remain compatible.

## Verification
| Check | Result | Evidence/limit |
| --- | --- | --- |
| npm run check:layout | PASS | Feature/mirrored test placement |
| Strict source and spec TypeScript | PASS | Includes unused source checks |
| git diff --check | PASS | No whitespace errors |
| npm test -- --watch=false --browsers=ChromeHeadless | PASS | 27/27; includes grouping/no-duplicates, row intents, missing document navigation/reload and existing state races/Markdown/copy/download |
| Production build, isolated dist/migration-verification | PASS | No compiler/budget warnings; non-empty 3rdpartylicenses.txt |
| Live catalogue | PASS | 42 actual repositories; keyboard End scrolled the list to 2731; no-results search, clear and prefix selection checked |
| Live detail | PASS | service-backstage opened; README and 7-operation OpenAPI navigation rendered in new panels |
| Optional docs | PASS with existing data limitation | Live runbook/metadata GETs returned Unable to load document; sections and reload stayed available; synthetic tests cover empty states/reload intents |
| Desktop bounds | PASS | At 1940×962, list panels ended y=946 and document dimensions matched viewport; detail panels also ended y=946 |
| Mobile bounds | PASS | At 375×568, final catalogue list body 167px with 3229px content, panel bottom y=552 and page 375×568; keyboard End reached 3062 |
| Mobile docs | PASS | Compact detail actions preserved labels; document body 167px with >2000px content, panel bottom y=552 and page 375×568 |

Temporary viewport was restored and the catalogue returned to its starting position.
Sync-all/forced refresh were not invoked against live repos; unit/store doubles
verify these commands. No live tryout requests, deployment or package publication.
A cached syncError alongside syncStatus=ok was observed on live detail; the existing
rule hides that stale message for successful status, with no backend data changes.

## Contracts and remaining work
No route/federation export/shared-version, DTO/API, backend/persistence/authorization
or store orchestration changes. No external migration required. Optional documents
remain repository/service-owned; their missing data does not block presentation
acceptance. All four migration tasks are complete. Architecture/development/index
now describe the new surfaces, scrolling and verification limits.
