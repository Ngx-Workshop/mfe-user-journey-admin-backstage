# Backstage readiness

Baseline findings and intended remediation are in specs/001-mvvm-refactor/plan.md.
Final verification and remaining integration gaps are in its handoff.md.
OpenAPI currently accepts JSON only; live tryout is disabled. Backend owns document
availability, sync and authorization; missing documents must remain recoverable.

## Refactor results

The MVVM migration resolves the audited source gaps. Local unit/component coverage
and live host smoke checks are recorded in the feature handoff. OpenAPI JSON-only
parsing and disabled tryout remain inherited limits. Other shared Material/CDK
secondary entry warnings may appear from shell/remote duplication; they do not
prevent the verified journeys. Consolidating the wider shared UI dependency graph
requires cross-remote coordination and is outside this local refactor.
