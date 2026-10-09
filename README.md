# Backstage<br><sup>MFE User Journey - Admin</sup>

<img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/angular-gradient-wordmark.gif?raw=true" height="132" alt="Angular Logo" /> <img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/module-federation-logo.svg?raw=true" height="132" style="max-width: 100%;height: 132px;" alt="Module Federation" />

Angular micro-frontend (remote) for the **Admin Backstage** user journey in the NGX Workshop ecosystem.

It provides:

- A Backstage services catalog list with search + refresh + “sync all”.
- A service detail view with tabs for README, OpenAPI, optional runbook, and optional metadata.
- A lightweight OpenAPI explorer (operation search + schema viewer).

## Tech stack

- Angular 21 (standalone, built-in control flow, signals)
- Zoneless change detection + `OnPush` components
- Module Federation via `@angular-architects/module-federation`
- Angular Material UI
- Typed DTOs from `@tmdjr/backstage-contracts`

## Getting started

### Prerequisites

- Node.js 20+
- npm 8+

### Install

```bash
npm install
```

### Run locally

This remote is configured to serve on `http://localhost:4201`.

Option A (recommended): Angular dev server

```bash
npm start
```

Option B: serve the built bundle (closer to how a host app consumes the remote)

```bash
npm run dev:bundle
```

Notes:

- `npm run dev:bundle` runs the build watcher + a static server on port `4201`.
- `src/index.html` loads `/env.js` for runtime configuration. If your environment doesn’t provide it, either supply an empty `public/env.js` file or remove the script tag; the UI itself calls a relative API (see “Backend/API”).

### Tests

```bash
npm test
```

## Module Federation (how hosts consume this remote)

The remote entry is served as:

- `http://localhost:4201/remoteEntry.js`

Exposes (see `webpack.config.js`):

- `./Component` → `src/app/app.ts` (default export of the root component)
- `./Routes` → `src/app/app.routes.ts` (Angular `Route[]`)

In a host app, you typically wire it up as a remote route. Example (host-side):

```ts
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes = [
  {
    path: 'backstage',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Routes',
      }).then((m) => m.Routes),
  },
];
```

## Backend/API and architecture

The stateless client calls same-origin /api/backstage/services, /services/:repo,
/sync and /services/:repo/{readme|openapi|runbook|metadata}. The gateway routes this
prefix to service-backstage. Document endpoints return raw text, adapted into typed
viewer documents; the backend remains responsible for authorization.

Feature code lives in src/app/features/backstage, split into api, singleton state,
models, pure utils, scoped page view models and reusable input/output views.
RxJS owns asynchronous orchestration/cancellation; readonly signals expose state.
Components keep templates and BEM SCSS inline.

The remote routes are list and details/:repo; mounted in the shell they become
/backstage/list and /backstage/details/:repo. The empty route redirects to list.

Read [architecture](docs/architecture.md), [API contracts](docs/api-contracts.md),
[source organization](docs/source-organization.md) and [development](docs/development.md).
The local [Spec Kit workflow](.specify/README.md) is adapted from the document editor;
[AGENTS.md](AGENTS.md) is the entry point and [specs](specs/README.md) indexes work.

## Scripts

- `npm start`: run dev server on `:4201`
- `npm run build`: production build to `dist/mfe-user-journey-admin-backstage`
- `npm run watch`: dev build in watch mode
- `npm run serve:bundle`: serve `dist/…` on `:4201` (CORS enabled)
- `npm run dev:bundle`: `watch` + `serve:bundle`
- `npm run run:all`: launch `mf-dev-server` (useful when working with multiple MFEs locally)

## Repository

- https://github.com/Ngx-Workshop/mfe-user-journey-admin-backstage
