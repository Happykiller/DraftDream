# DraftDream Backoffice

## Overview
This repository hosts the DraftDream backoffice, a React-based administrative dashboard that supports the fitness-product ecosystem. The application enables content editors and coaches to manage catalogues of programs, sessions, exercises, tags, and associated assets in real time while enforcing role-based access via the underlying GraphQL API.

## Key Features
- Catalogue management for programs, sessions, exercises, equipment, muscles, tags, and categories.
- Locale-aware content editing through shared slug/label conventions.
- Secure authentication flow backed by JWT and protected routes.
- Flash messaging and optimistic reloading for CRUD operations.
- Docker-first workflows for local development and containerized deployment.

## Architecture
| Layer | Responsibilities | Technology |
| ----- | ---------------- | ---------- |
| Frontend | React application built with Vite | React 18, TypeScript, Vite |
| UI Kit | Component styling and layout | MUI (Material UI) |
| State & Data | Query layer and shared stores | Zustand, fetch-based GraphQL client |
| Backing API | Remote GraphQL endpoints | External service (not part of this repo) |

The app follows a modular structure under `src/`, with feature slices (`components`, `hooks`, `pages`) wired together through dependency injection helpers and locale bundles.

## Tech Stack
- Node.js 20.x
- React 18 + TypeScript
- Vite 5 build tooling
- MUI component library
- GraphQL over HTTP
- ESLint + TypeScript ESLint
- Docker & Docker Compose

## Prerequisites
- Node.js 20 (LTS) and npm 10
- Docker Desktop 4.x (for container workflows)
- Access to DraftDream GraphQL endpoint and authentication credentials

## Environment Configuration
Create a `.env.local` file at the project root with the following variables:
```bash
VITE_GRAPHQL_ENDPOINT='https://api.draftdream.tld/graphql'
VITE_APP_ENV='development'
```

For Docker-based workflows, mirror the variables in `.env.docker` or use compose overrides as described below.

## Local Development (Node)
```bash
npm install
npm run dev
```
The development server listens on `http://localhost:5173` by default. Hot Module Replacement (HMR) is enabled.

### Available NPM Scripts
| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and generate production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint with the configured ruleset |

## Development with Docker
The repository ships with a Docker workflow to standardize local environments.

### Build the Dev Image
```bash
docker build -t draftdream/backoffice:dev -f Dockerfile .
```

### Run in Development Mode
```bash
docker compose -f docker-compose.dev.yml up --build
```
This compose file typically mounts the source directory, exposes port `5173`, and installs dependencies on first run. Adjust the compose file to point to your GraphQL endpoint if different from `.env.docker` defaults.

### Execute One-off Commands
```bash
docker compose -f docker-compose.dev.yml run --rm web npm run lint
docker compose -f docker-compose.dev.yml run --rm web npm run build
```

### Production-like Build
Use the published Dockerfile stages to produce an optimized bundle served via Nginx.
```bash
docker build -t draftdream/backoffice:prod -f Dockerfile --target production .
docker run --rm -p 8080:80 draftdream/backoffice:prod
```
The production image serves the compiled assets from `/usr/share/nginx/html`. Review `nginx.conf` for caching and route handling rules.

## Testing & Quality
- Type checking happens automatically during `npm run build` via the Vite + TypeScript pipeline.
- ESLint enforces linting rules. Run `npm run lint` locally or inside Docker before pushing changes.
- GraphQL interactions rely on runtime validation delivered by the server; for integration testing, point the app to a staging API.

## Localization
Translations live under `src/locales/`. Each feature should introduce the necessary keys for both English (`en`) and French (`fr`). When adding new label types, keep the JSON structure aligned across locales.

## CI/CD Integration
While CI configuration is not stored in this repository, the following steps are recommended for pipelines:
1. Install dependencies using `npm ci`.
2. Run `npm run lint` to enforce static checks.
3. Execute `npm run build` to confirm the production bundle compiles.
4. Optionally build and push the production Docker image.

## Troubleshooting
| Issue | Resolution |
| ----- | ---------- |
| `Cannot return null for non-nullable field` in flash messages | Inspect the upstream GraphQL payload; the front-end now surfaces the error once per request. |
| Dev server cannot reach API | Confirm `VITE_GRAPHQL_ENDPOINT` points to a reachable host and that CORS policies allow the origin. |
| Docker build fails on dependency install | Ensure the Node version inside the container matches the one used locally (20.x). |

## Contributing
1. Create a feature branch from `main`.
2. Follow the established naming conventions (slug + locale + label).
3. Update locale bundles, hooks, and GraphQL queries together to keep schema parity.
4. Run linting and build checks prior to submitting pull requests.
5. Describe user-facing changes in the PR template and include screenshots for UI updates.

## License
All rights reserved. DraftDream backoffice is proprietary software; redistribution or reuse requires explicit authorization from DraftDream SARL.
