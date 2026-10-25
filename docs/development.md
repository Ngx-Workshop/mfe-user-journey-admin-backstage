# Development and verification

## Build toolchain compatibility

Keep `@angular-devkit/build-angular` pinned to `21.2.26` and the npm webpack
override at `5.105.2`. Builder `21.2.28` uses webpack `5.112.0`, whose federation
identifiers break `license-webpack-plugin@4.0.2` with an undefined `trim` error.
Both pins keep one compatible webpack runtime. Keep license extraction enabled;
validate a normal production build and non-empty `3rdpartylicenses.txt` before
removing these pins after an upstream fix.

Install using npm ci. Angular dev server and static bundle server both use port 4201;
do not start a second server over an existing one. npm start uses the dev server;
npm run dev:bundle watches a development build and serves dist. The host commonly
mounts this remote at https://admin.ngx-workshop.io/backstage/list.

- npm run check:layout — feature-first folders and mirrored test layout.
- npm test -- --watch=false --browsers=ChromeHeadless — deterministic Jasmine/Karma
  feature and component regressions; Chrome must be available.
- npm run build — production bundle, strict templates and style budgets.

Tests live under testing/app. Karma include paths are relative to sourceRoot, so
angular.json uses ../testing/**/*.spec.ts; tsconfig.spec.json includes testing.
Source builds do not establish live host integration. A static server must serve
the rebuilt output, followed by a full host reload to replace cached federation
chunks. Preserve the user's running server.

Constitution, architecture and specs document ownership and validation. Final
results are in specs/001-mvvm-refactor/handoff.md. No deployment is required.
