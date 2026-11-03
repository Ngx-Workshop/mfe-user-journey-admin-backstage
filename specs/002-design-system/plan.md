# Implementation plan
Status: Complete
Updated: 2026-11-02

## Baseline and design
Manifest/federation already share design-system 21.0.10. Current list/detail have
particle heroes and custom sticky action bars; catalogue cards are unbounded and
document viewers use Material colors/custom code surfaces. Add a public bounded
panel presenter and measured viewport utility. Compose filter/catalogue/issues
panels with compact typed row intents. Detail composes metadata/document panels
and native document selection. Adopt semantic tokens/shared buttons/status and
code blocks while retaining safe Markdown and document actions.

## Constitution and contracts
Existing API clients, singleton stores and scoped VMs retain all command/stream
ownership. Presenters accept inputs/emit intent; no transport/state injection.
App/Routes and published DTOs stay compatible; no new services/dependencies.
Use inline OnPush/BEM, focused presenters and lifetime-cleaned DOM observers.
Existing source/behavior discrepancies belong in the handoff, not silent changes.

## Verification
Run check:layout, strict app/spec TypeScript, full Karma and isolated production
build (license output intact). Verify partition, compact row view/refresh, missing
document tabs/retry and code text safety. Shell checks cover list/search/detail,
read-only document tabs and desktop/mobile panel bounds; no live sync writes.
