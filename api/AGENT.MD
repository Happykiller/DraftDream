# DraftDream API Agent Guidelines

## Context
- NestJS 11 service exposing a GraphQL API over Fastify/Mercurius.
- Hexagonal structure: business logic in `src/usecases`, infrastructure in `src/services`, presentation adapters in `src/graphql`.
- MongoDB acts as the primary datastore and is wired through a custom Inversify container (`src/inversify/investify.ts`).
- Configuration layers (`src/config`) merge `defaults.ts` with environment overrides and `.env` values.

## Source Layout Pointers
- `src/main.ts` boots Nest with the Fastify adapter after initializing the Inversify container.
- `src/graphql/**`: resolvers, DTOs, guards, and decorators. Keep resolver classes slim—delegate to use cases and reuse shared DTOs from `common/` when possible.
- `src/usecases/**`: pure application services. They may depend on abstractions (interfaces) but never on NestJS, Mongo drivers, or other infrastructure concerns.
- `src/services/**`: infrastructure adapters (Mongo repositories, auth, logging). Update the bindings in `src/inversify/investify.ts` whenever a new service or repository is introduced.
- `src/common/**`: shared helpers (error builders, logger setup, slug utilities). Prefer extending these utilities instead of duplicating logic elsewhere.

## Implementation Rules
- Always inject dependencies through constructors using the Inversify container; avoid `new` on repositories or services inside resolvers/use cases.
- When exposing new capabilities:
  1. Define or extend the use case inside `src/usecases/**`.
  2. Bind the use case and its dependencies inside `src/inversify/investify.ts`.
  3. Surface the functionality through a resolver in `src/graphql/**`, mapping domain results to GraphQL types/DTOs.
- Reuse the `Auth` decorator and guards for authorization. Add new role constants to `src/graphql/common/role.enum.ts` if required.
- Centralize configuration keys in `src/config/defaults.ts` and document new variables in `README.md`.
- When introducing migrations or seed data, place them under `src/services/db/migrations` and register them in the migration runner.
- **Error Handling in Use Cases**: Always wrap the `execute` method logic in a `try/catch` block. In the `catch` block, log the error using `this.inversify.loggerService.error` and throw a normalized error using `normalizeError(error, ERRORS.YOUR_FALLBACK_ERROR)`.

## Authorization and visibility rules
- The only valid visibility values are `public` and `private`; do not reintroduce `hybrid`.
- Use cases own business authorization rules (ownership, visibility, assignments). Pure role-based access control (no additional business rules) must live in the GraphQL layer via `@Auth`, not in use cases.
- Apply these business rules consistently:
  - **Create**: any authenticated role may create. Admins can choose public or private; coaches and front-office clients create private items only.
  - **Read/Get**: callable by all roles.
  - **List**: public items are listable by anyone; private items are listable only by their creator or an admin. Athletes may only list programs and nutrition plans where they are assigned as the athlete.
  - **Update**: only the creator or an admin can update.
  - **Soft delete**: only the creator or an admin can soft-delete.
  - **Hard delete**: admins only.

## Testing & Quality Gates
- Run `npm run build` as a smoke test; it type-checks and ensures Nest compiles.
- Prefer adding targeted unit tests under a future `src/__tests__` structure when introducing complex domain logic.
- For schema changes, regenerate `docs/gqlschema.gql` by starting the server (`npm run start:dev`) and commit the updated schema when it is materially different.

## Operational Tips
- Keep logging consistent via `common/logger.ts` helpers; avoid `console.log`.
- Enforce English comments and staircase-style imports as defined in the root `AGENTS.md`.
- Treat secrets (`JWT_SECRET`, database credentials) as sensitive—never print them in logs or commits.

## Definition of Done
- **Documentation**: If use cases are modified, update the corresponding documentation in `docs/features`.
- **Testing**: Finish with unit tests; only use cases need to be tested.
- **Linting**: Ensure the linter checks pass (`npm run lint`).
- **Build**: Run `npm run build` to ensure the project compiles successfully.

## Code Quality Standards
- **Maintainability**: Write code that is easy to understand and modify. Prefer clarity over premature optimization.
- **Reliability**: Ensure robust error handling and comprehensive testing.
- **Separation of Concerns**: Keep business logic in use cases, infrastructure in services, and presentation in resolvers.
- **Explicit Contracts**: Use distinct DTOs for input/output and Models for domain entities. Avoid sharing types across layers if it couples them tightly.
- **Consistent Patterns**: Follow existing naming conventions and architectural patterns throughout the project.
- **Conventions**: Use the same coding conventions (naming, structure, formatting) across the entire codebase.
- **Language**: English is mandatory for all code elements, including variable names, functions, classes, and keys. French is strictly forbidden in code.

## Repository Delete Policy
- **Soft Delete (Preferred)**: Set `deletedAt` timestamp, preserve data for audit/recovery
  - Use for: All user-generated content (exercises, programs, meals, prospects, etc.)
  - Implementation: Update `deletedAt` field instead of removing document
  - Query filter: Always check `deletedAt: { $exists: false }` for active records
- **Hard Delete (Exceptions)**: Permanently remove from database
  - Use for: Only when explicitly required for data privacy/compliance
  - Require: Admin-level authorization and explicit confirmation
