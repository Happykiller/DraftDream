# DraftDream Frontoffice Agent Guidelines

## 1. Core Philosophy: Quality First
To ensure a maintainable, resilient, and high-quality codebase, we adhere to the following principles:

-   **Clean Code**: Code is read much more often than it is written. Write code that is self-explanatory, simple, and concise.
-   **SOLID Principles**: Apply SOLID principles, particularly **Single Responsibility** (components/functions should do one thing well) and **Dependency Inversion** (rely on abstractions/interfaces).
-   **The Boy Scout Rule**: Always leave the code better than you found it. If you touch a file, improve its structure, naming, or tests.
-   **Zero Broken Windows**: Do not tolerate warnings, linting errors, or commented-out code. Fix them immediately.

## 2. Architecture & Maintainability
-   **Strict Separation of Concerns**:
    -   **View (Components)**: Pure JSX. Focus on rendering and user interaction. Minimal logic.
    -   **Logic (Hooks)**: Encapsulate business logic, state management, and side effects in custom hooks (`use...`).
    -   **Data (Services/Stores)**: Handle API communication and global state.
-   **Inversion of Control**: Use the existing Inversify container for shared services.
-   **Atomic/Feature Structure**: Organize components by feature or complexity (atoms/molecules) to promote reusability.

## 3. Reliability & Resilience
-   **Strict TypeScript**:
    -   No `any`. Define strict interfaces for props, state, and API responses.
    -   Enable and respect strict null checks.
-   **Error Handling**:
    -   Route **ALL** asynchronous workflows (GraphQL, Loaders) through `src/hooks/useAsyncTask.ts`.
    -   This ensures centralized error handling and keeps the global loading overlay synchronized.
-   **Boundary Testing**: Validate data at system boundaries (API responses, user inputs) before using it.

## 4. Readability & Standards
-   **Naming Conventions**:
    -   **Components**: `PascalCase` (e.g., `UserProfile.tsx`).
    -   **Functions/Hooks**: `camelCase` (e.g., `useAuth`, `fetchData`).
    -   **Variables**: Descriptive and pronounceable. Avoid single letters (except `i` in loops).
-   **Comments**:
    -   Explain **WHY**, not **WHAT**. The code should show what it does.
    -   **Language**: English only.
    -   **JSDoc**: Document complex functions and public interfaces.
-   **File Organization**: Co-locate related files (styles, tests, sub-components) to keep context close.

## 5. Context & Tech Stack
-   **Framework**: React 19 + TypeScript + Vite 7.
-   **State**: Zustand (Session/Global) + React Query/Apollo (Server State - via `graphql.service.fetch.ts`).
-   **UI**: Material UI (MUI) v6.
-   **i18n**: i18next (English/French).

## 6. Source Layout & Implementation Rules
-   **Entry Points**:
    -   `src/main.tsx`: Global providers.
    -   `src/routes/router.tsx`: Navigation & Lazy loading. Wrap routes with `withTitle`.
-   **Layouts**: `PublicLayout` vs `ProtectedLayout`. Auth checks belong in loaders (`requireAuthLoader`).
-   **Pages**: Declarative. Start JSX with `{/* General information */}` marker.
-   **Services**:
    -   `src/services/graphql/graphql.service.fetch.ts`: **SINGLE** entry point for GraphQL.
    -   Never use `fetch` directly.
-   **Stores**: `src/stores/session.ts` for auth. Use exported helpers, never `localStorage` directly.
-   **Imports**: Use aliases (`@components`, `@stores`) from `tsconfig.app.json`. Staircase formatting.

## 7. Coding Guidelines & Specifics
1.  **MUI Grid v6**:
    -   Use `size` prop: `<Grid size={{ xs: 12, md: 5 }}>`.
    -   Avoid deprecated `item`, `xs={...}` props on Grid items.
2.  **Internationalization**:
    -   Update `src/locales/en` and `src/locales/fr` simultaneously.
    -   **NO** default value fallbacks in code. Missing keys must fail loudly.
3.  **Async Workflows**:
    -   **MANDATORY**: Wrap all async ops in `useAsyncTask`.


## 8. Operational Tips
-   **Env Vars**: Access via `src/config/env.ts`, never `import.meta.env` directly.
-   **UX Changes**: Capture screenshots for PRs.

## 9. Definition of Done
Before considering any task complete, the following checks MUST be performed:
1.  **Linting**: Run `npm run lint` and ensure there are no errors or warnings.
2.  **Build**: Run `npm run build` to verify type safety and compilation.
3.  **Clean Code**: Ensure no `console.log`, commented-out code, or `any` types remain.
4.  **Self-Review**: Verify that the changes meet the requirements and follow the architectural guidelines.
