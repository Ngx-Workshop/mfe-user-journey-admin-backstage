# MFE User Journey - Admin - Backstage

<img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/angular-gradient-wordmark.gif?raw=true" height="132" alt="Angular Logo" /> <img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/module-federation-logo.svg?raw=true" height="132" alt="Angular Logo" />

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

## Backend/API

This MFE calls the Backstage API via a **relative** base URL:

- `/api/backstage/…` (see `src/app/backstage/services/backstage-api-client.service.ts`)

That means the **host app / gateway** must route `/api/backstage` to the Backstage service.

Key calls:

- `GET /api/backstage/backstage/services` (list)
- `GET /api/backstage/backstage/services/:repo` (detail)
- `POST /api/backstage/backstage/sync` (sync all)
- `GET /api/backstage/backstage/services/:repo/{readme|openapi|runbook|metadata}` (doc blobs)

## Architecture overview

### Runtime entrypoints

- `src/main.ts` → dynamic import of `src/bootstrap.ts`
- `src/bootstrap.ts` → `bootstrapApplication(App, appConfig)`
- `src/app/app.config.ts` → sets up router, HttpClient, animations, Reactive Forms, and **zoneless** change detection

### Routing

The remote ships its own routes in `src/app/app.routes.ts`:

- `/backstage` → list page
- `/backstage/:repo` → detail page

These are the routes hosts usually mount under a shell route segment.

### Feature layout

Core Backstage feature code lives under `src/app/backstage/`:

- `pages/`
  - `backstage-list.page.ts`: list + search + sync all
  - `backstage-detail.page.ts`: detail header + tabbed docs
- `services/`
  - `backstage-api-client.service.ts`: HTTP client (relative `/api/backstage/`)
  - `backstage-facade.service.ts`: state + orchestration (signals + RxJS)
- `components/`
  - `markdown-viewer.component.ts`: README/runbook rendering (via `marked`)
  - `openapi-viewer.component.ts`: OpenAPI explorer (operation search + schema)
  - `schema-tree.component.ts`: schema visualization

### State management (signals + RxJS)

The pattern used is:

- **Signals** for UI state (`listState`, `detailState`, `docStates`, `search`, …)
- **RxJS streams** for debounced search and list reloads
- “Docs” are lazy-loaded: switching tabs triggers a fetch only if the doc content is missing

## Scripts

- `npm start`: run dev server on `:4201`
- `npm run build`: production build to `dist/mfe-user-journey-admin-backstage`
- `npm run watch`: dev build in watch mode
- `npm run serve:bundle`: serve `dist/…` on `:4201` (CORS enabled)
- `npm run dev:bundle`: `watch` + `serve:bundle`
- `npm run run:all`: launch `mf-dev-server` (useful when working with multiple MFEs locally)

## Repository

- https://github.com/Ngx-Workshop/mfe-user-journey-admin-backstage
