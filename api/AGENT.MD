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

## Testing & Quality Gates
- Run `npm run build` as a smoke test; it type-checks and ensures Nest compiles.
- Prefer adding targeted unit tests under a future `src/__tests__` structure when introducing complex domain logic.
- For schema changes, regenerate `docs/gqlschema.gql` by starting the server (`npm run start:dev`) and commit the updated schema when it is materially different.

## Operational Tips
- Keep logging consistent via `common/logger.ts` helpers; avoid `console.log`.
- Enforce English comments and staircase-style imports as defined in the root `AGENTS.md`.
- Treat secrets (`JWT_SECRET`, database credentials) as sensitive—never print them in logs or commits.
