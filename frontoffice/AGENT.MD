# DraftDream Frontoffice Agent Guidelines

## Context
- React 19 + TypeScript application compiled with Vite 7.
- Consumer-facing portal for coaches and athletes; communicates exclusively with the DraftDream GraphQL API.
- Shares the same technical stack as the backoffice (React, MUI, Zustand, i18next) but targets a lighter feature set.

## Source Layout Pointers
- `src/main.tsx` wires global providers (Router, Theme) and bootstraps the root `<App />`.
- `src/routes/router.tsx` defines all navigation via `createBrowserRouter` with lazy-loaded route components. Update this file when adding pages and wrap components with `withTitle` for document titles.
- `src/layouts/PublicLayout` and `src/layouts/ProtectedLayout` gate anonymous vs. authenticated areas. Keep authentication checks inside loaders (`requireAuthLoader`).
- `src/pages/**` contains route-level screens. Keep them declarative: fetch data through hooks/services and ensure the JSX starts with `{/* General information */}` as required globally.
- `src/components/**` holds reusable UI primitives; `src/commons/**` carries constants and the lightweight Inversify container that builds shared services.
- `src/services/graphql/graphql.service.fetch.ts` is the single entry point for GraphQL calls. Always use this helper so unauthorized flows and logging stay consistent.
- `src/stores/session.ts` persists auth context with Zustand. Prefer manipulating session state via the exported store helpers instead of touching `localStorage` directly.

## Implementation Rules
- Use the path aliases defined in `tsconfig.app.json` (e.g., `@components/*`, `@stores/*`, `@app-types/*`) to avoid brittle relative paths.
- Keep business decisions inside hooks or dedicated services. Components should focus on rendering and delegating actions.
- Extend translations in both `src/locales/en` and `src/locales/fr` simultaneously; missing keys must fail loudly rather than relying on defaults.
- When adding API interactions, expose them as async functions within a domain-specific service (e.g., `src/services/graphql/<feature>.ts`) and call them from hooks/pages.
- Route every asynchronous workflow (GraphQL fetches, mutations, loaders, service calls) through `src/hooks/useAsyncTask.ts` so `useLoaderStore` fuels the global overlay. For example, the login form wraps its authentication mutation inside `useAsyncTask` to keep the overlay synchronized.
- Styling goes through the shared Material UI theme under `src/theme`. Override components via theme augmentation before resorting to inline styles.

## Testing & Quality Gates
- Run `npm run build` before committing to ensure the type checker and Vite compiler succeed.
- Run `npm run lint` once the ESLint flat-config plugins are registered as objects (current configuration may require adjustments). Do not introduce new code that bypasses linting expectations.
- For significant UX changes, capture screenshots (via the browser tooling) and link them in PR descriptions.

## Operational Tips
- Environment variables are read via `src/config/env.ts`. Add new keys there and document them in the README; never access `import.meta.env` directly in components.
- Respect the shared coding conventions from the repository root (English comments, staircase imports, JSX marker comment).
- Avoid direct `fetch` usage—always route network calls through the GraphQL service to keep error handling centralized.

## Coding Guidelines
1. **Import structure**:
   - Use staircase-style formatting.
   - Separate external libraries from internal modules.
2. **Comments**:
   - Write in English, clear and concise.
   - Comment classes, functions, methods, and complex logic.
   - Focus on readability and effectiveness.
3. **Component templates**:
   - Always include and maintain the JSX marker comment ` {/* General information */}` within component templates.
4. **Internationalization**:
   - Do not rely on translation `defaultValue` fallbacks; keep localization dictionaries up to date for every supported language.
5. **Async workflows**:
   - Route every asynchronous workflow (GraphQL fetches, mutations, loaders, service calls) through `src/hooks/useAsyncTask.ts` so `useLoaderStore` fuels the global overlay. For example, the login form wraps its authentication mutation inside `useAsyncTask` to keep the overlay synchronized.
6. **MUI Grid syntax (v6+)**
   - Use the new prop `size` instead of `item` and `xs`/`md`.
   - **Deprecated:** `<Grid item xs={12} md={5}>`
   - **Correct:** `<Grid size={{ xs: 12, md: 5 }}>`
   - Keep `container` for parent grids, and use `spacing`, `rowSpacing`, or `columnSpacing` as usual.
