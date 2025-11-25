# DraftDream Backoffice Agent Guidelines

## Context
- React 19 + TypeScript administrative console built with Vite 7 and Material UI.
- Shares the same technical foundation as the frontoffice (React Router, Zustand, i18next, custom Inversify container) but exposes richer management workflows (catalog CRUD, grids, editors).
- Talks exclusively to the DraftDream GraphQL API through the shared fetch adapter.
- **Quality Standard**: This project prioritizes maintainability, readability, and resilience. Code should be "clean", self-documenting where possible, and robust against runtime errors.

## Source Layout Pointers
- `src/main.tsx` initializes the React tree, Material UI theme, and router provider.
- `src/routes/router.tsx` declares all routes with lazy-loaded pages. Maintain loaders and guards here, and wrap entries with `withTitle` for document titles.
- `src/layouts/**` contains layout shells for authenticated vs. public areas. Keep access checks inside loaders (`requireAuthLoader`).
- `src/pages/**` holds feature screens; keep them declarative and ensure the JSX template starts with `{/* General information */}` per the global guideline.
- `src/components/**` hosts reusable widgets (forms, tables, dialogs). Prefer extracting reusable form logic here instead of duplicating it across pages.
- `src/services/graphql/graphql.service.fetch.ts` centralizes GraphQL calls, automatic token forwarding, and unauthorized handling. Use it for every network interaction.
- `src/stores/**` maintains client-side state (e.g., `session` store backed by `localStorage`).
- `src/locales/{en,fr}` store translation bundles. Update both locales together when adding or renaming keys.

## Implementation Rules

### Architecture & Structure
- **Separation of Concerns**: Keep heavy business workflows inside hooks (`src/hooks/**`) or dedicated service modules. Components should be primarily presentational and compose hooks, not run imperative logic directly.
- **Colocation**: When introducing CRUD operations, colocate GraphQL documents and data mappers near the corresponding page or feature module. Re-export them from an index file for discoverability.
- **Component Design**:
    - **Container/Presentational**: Where complex, separate data fetching (Container) from rendering (Presentational).
    - **Prop Drilling**: Limit prop drilling to a maximum of 2 levels. Use Context or Zustand for state needed deeper in the tree.
- **Imports**: Observe path aliases from `tsconfig.app.json` (e.g., `@components/*`, `@services/*`) and keep imports in staircase order (external → internal).

### Clean Code & Refactoring
- **Naming Conventions**:
    - Variables: Use descriptive names. Booleans should start with `is`, `has`, `should` (e.g., `isVisible`, `hasAccess`).
    - Functions: Verb-noun pairs (e.g., `fetchUserData`, `handleSubmit`).
    - Constants: UPPER_SNAKE_CASE for true constants.
- **Function Size**: Keep functions small and focused on a single responsibility. If a function grows too large, extract helper functions.
- **Magic Numbers**: Avoid magic numbers and strings. Define them as named constants.
- **Early Returns**: Use early returns to reduce nesting and improve readability.

### Reliability & Resilience
- **Error Handling**:
    - Use Error Boundaries for major feature sections to prevent the entire app from crashing.
    - Handle API errors gracefully in the UI (toasts, error states).
- **Validation**:
    - Validate all external data (API responses, user input).
    - Use Zod for schema validation where appropriate.
- **TypeScript**:
    - **Strict Typing**: No `any`. Use `unknown` for data of uncertain shape and narrow it down.
    - **Interfaces**: Define explicit interfaces for component props and API responses.

### UI & UX
- **Material UI**: Leverage `src/theme` for styling consistency. Extend components through theme overrides before using ad-hoc CSS.
- **DataGrid**: Favor DataGrid (`@mui/x-data-grid`) for tabular data management. Configure column definitions in dedicated modules.
- **Async Workflows**: Route every asynchronous workflow (GraphQL fetches, mutations, loaders, service calls) through `src/hooks/useAsyncTask.ts` so `useLoaderStore` fuels the global overlay.

## Testing & Quality Gates
- Run `npm run build` before pushing changes to ensure the TypeScript compiler and bundler succeed.
- Linting shares the flat ESLint configuration from the frontoffice. Until the shared config is fixed (plugins must be registered as objects), document any temporary deviations in your PR and avoid introducing new lint warnings.
- Capture screenshots or screen recordings for UI-affecting changes and attach them to the PR description.

## Definition of Done
Before considering a task complete, ensure the following checks are met:
- [ ] **Linting**: Run `npm run lint` and ensure there are no errors or warnings.
- [ ] **Build**: Run `npm run build` to verify the project compiles successfully.
- [ ] **Tests**: Run tests (if applicable) and ensure they pass.
- [ ] **Self-Review**: Review your own code against the "Implementation Rules" and "Coding Guidelines".

## Operational Tips
- Access environment variables exclusively through `src/config/env.ts`; declare new settings there and document them in the README.
- Respect repository-wide conventions: English comments, `{/* General information */}` marker at the top of component templates, and no direct `console.log`.
- Keep authentication flows consistent by mutating the Zustand stores via their exposed actions instead of reaching into storage primitives.

## Coding Guidelines
1. **Import structure**:
   - Use staircase-style formatting.
   - Separate external libraries from internal modules.
2. **Comments**:
   - **Why, not What**: Explain the reasoning behind complex logic, not just what the code does.
   - Write in English, clear and concise.
   - Comment classes, functions, methods, and complex logic.
3. **Component templates**:
   - Always include and maintain the JSX marker comment ` {/* General information */}` within component templates.
4. **Internationalization**:
   - Do not rely on translation `defaultValue` fallbacks; keep localization dictionaries up to date for every supported language.
5. **Immutability**:
   - Prefer immutable data structures. Use spread operators or utility libraries for state updates.
6. **MUI Grid syntax (v6+)**
   - Use the new prop `size` instead of `item` and `xs`/`md`.
   - **Deprecated:** `<Grid item xs={12} md={5}>`
   - **Correct:** `<Grid size={{ xs: 12, md: 5 }}>`
   - Keep `container` for parent grids, and use `spacing`, `rowSpacing`, or `columnSpacing` as usual.