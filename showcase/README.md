# FitDesk Showcase

A lightweight React + Vite microsite that introduces FitDesk and exposes consolidated release notes across the platform. The site is designed for static hosting so stakeholders can review the roadmap without authenticating into the operational consoles.

## Features

- Elegant landing page highlighting the FitDesk value proposition.
- Dedicated changelog view that reads the platform `VERSION` and changelog files from the API, frontoffice, and backoffice projects.
- Material UI theme with typography tuned for executive briefings and product marketing collateral.
- Hash-based routing to keep the output compatible with static object storage or CDN deployments.

## Getting started

```bash
cd .showcase
npm install
```

### Run the development server

```bash
npm run dev
```

The application is served with hot-module reloading on <http://localhost:5173/> by default.

### Build a static bundle

```bash
npm run build
```

The production-ready static bundle is generated inside `dist/`. Preview it locally with:

```bash
npm run preview
```

## Static hosting notes

- The project uses a `HashRouter` so the static bundle works without custom rewrite rules.
- Because the changelog view reads markdown files from sibling projects, ensure those files remain present when running the build pipeline.
- Adjust the `vite.config.ts` `server.fs.allow` list if additional upstream changelog files are introduced.
