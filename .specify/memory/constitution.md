# Constitution — Backstage remote

Version: 1.0.0 · Ratified: 2026-10-09
Adapted from the document editor; this repository owns these rules.

1. **MVVM and streams.** Strict TypeScript/templates, standalone OnPush views,
   signals for projections and RxJS for async orchestration. Stateless HTTP
   adapters own transport; root stores own server state/cancellation/commands;
   page-scoped view models own route/UI orchestration. Presentation uses inputs
   and intent outputs, never injecting domain stores.
2. **Focused inline components.** Inline HTML and SCSS; approximately 230 lines
   is a soft target. Split meaningful responsibilities. BEM for application-owned
   classes; retain third-party classes.
3. **Truthful UX.** Material/shared headers, explicit loading/empty/error/access
   denial/retry, debounce and duplicate-command protection.
4. **Compatibility and accessibility.** Preserve default App, named Routes,
   remoteEntry.js, ./Component and ./Routes, route URLs, shared singleton versions
   and published DTOs. Server authorization is authoritative. Use keyboard controls,
   useful labels, sanitized Markdown and responsive layouts.
5. **Evidence.** Cover changed async races, recovery and visible behavior. Tests
   mirror source under testing/app. Builds do not prove host integration.
   Maintain spec/plan/tasks/handoff and affected local context.

Amend with version/date/rationale and dependent-template review.
