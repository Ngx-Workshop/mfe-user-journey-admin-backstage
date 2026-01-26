# mfe-user-journey-admin-backstage

A user-journey micro frontend built with Angular and Module Federation.

## Overview

This micro frontend now ships the Backstage admin journey:

- `/backstage` — catalog list with search, sync-all, and per-service refresh.
- `/backstage/:repo` — detail view with README, OpenAPI, optional runbook and metadata, refresh + open-repo.
- API client + facade wired to `service-backstage` using `@tmdjr/backstage-contracts` types.

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or higher)
- npm (v8.0.0 or higher)

### Installation

```bash
npm install
cp public/env.example.js public/env.js # then update the URL below
```

### Development

To start the development server:

```bash
npm run dev:bundle
```

This will:

- Start the webpack build in watch mode
- Serve the bundled application on http://localhost:4201
- Enable CORS for cross-origin requests

### Available Scripts

- `npm run dev:bundle` - Start development server with watch mode
- `npm run build` - Build the application for production
- `npm run watch` - Build in watch mode only
- `npm run serve:bundle` - Serve the built application
- `npm test` - Run unit tests

## Architecture

This micro frontend uses:

- **Angular 20+** - Frontend framework
- **Module Federation** - For micro frontend architecture
- **Webpack** - Module bundler and build tool
- **TypeScript** - Type-safe JavaScript development

## Module Federation Configuration

The micro frontend is exposed via Module Federation and can be consumed by host applications. Check the `webpack.config.js` file for exposed modules and configuration.

## Development Guidelines

1. Follow the established coding standards
2. Write unit tests for new features
3. Use TypeScript for type safety
4. Follow Angular best practices
5. Keep components focused and reusable

## Deployment

The application is automatically deployed via GitHub Actions when changes are pushed to the main branch.

## Repository

- **GitHub**: https://github.com/Ngx-Workshop/mfe-user-journey-admin-backstage
- **Type**: user-journey MFE

## Support

For questions or issues, please refer to the NGX Workshop documentation or create an issue in the repository.

---

Generated on Sat Jan 24 21:04:40 EST 2026 using the NGX Workshop MFE creation script.
