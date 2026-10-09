# Source organization

Feature code lives in src/app/features/backstage: api for stateless HTTP, state for
root singleton stores, models for domain state types, utils for pure projections,
pages for routed orchestrators/scoped view models and components for reused views.
Keep bootstrap and public app.routes.ts at the root. Tests mirror responsibility
folders under testing/app. Components use inline HTML/SCSS and BEM classes.
Run npm run check:layout after moving files. 230 lines is a soft component target.
