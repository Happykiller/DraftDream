# DraftDream API

GraphQL API built with NestJS, Fastify (via Mercurius), and MongoDB to power the DraftDream/fitdesk platform. The service exposes resolvers for authentication, user management, and a catalog of sports entities (programs, sessions, exercises, muscles, equipment, categories, tags). Dependencies are wired through a custom Inversify container that bootstraps MongoDB connectivity alongside reusable services (logging, hashing, JWT).

## Table of Contents
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the API](#running-the-api)
- [Authentication and Roles](#authentication-and-roles)
- [Seed Data and Migrations](#seed-data-and-migrations)
- [Logging](#logging)
- [Project Structure](#project-structure)
- [Docker](#docker)
- [Tests](#tests)

## Key Features
- GraphQL resolvers for `auth`, `user`, `tag`, `muscle`, `equipment`, `category`, `exercise`, `session`, `program`, and `system`.
- JWT-based authentication (`jose`) enforced by custom guards and role checks (`ADMIN`, `COACH`, `ATHLETE`).
- Central Inversify container (`src/inversify/investify.ts`) that instantiates services (Argon2 hashing, JWT, MongoDB repositories) and domain use cases.
- Native MongoDB integration with automatic migrations and seed data (admin bootstrap plus domain seed collections).
- Automatic GraphQL schema generation (`gqlschema.gql`) and dev-time playground support.
- Winston logging with development-friendly formatting and daily rotation in production.

## Architecture
- **Framework**: NestJS 11 using the Fastify adapter with Mercurius GraphQL driver.
- **GraphQL**: Code-first approach; resolvers and DTOs live in `src/graphql`.
- **Domain layer**: Use cases in `src/usecases` encapsulate business logic and call Mongo repositories in `src/services/db`.
- **Dependency injection**: Manual Inversify container built in `src/inversify/investify.ts`, invoked from `main.ts`.
- **TypeScript aliases**: `@src/*`, `@graphql/*`, `@usecases/*`, `@services/*` (see `tsconfig.json`).
- **Configuration**: `defaults.ts` merged with environment-specific overrides (`dev.ts`, `prod.ts`, `test.ts`, `mock.ts`) based on `NODE_ENV`.

## Prerequisites
- Node.js 20+ (Dockerfile targets `node:22-alpine`).
- npm 10+.
- Reachable MongoDB instance (local or remote).

## Installation
From the repository root (`api` folder):

```bash
npm install
```

Use `npm ci` to enforce the exact versions from `package-lock.json`.

## Configuration
Environment variables can be supplied via a `.env` file or the shell. The configuration is computed by:
1. Loading `defaults.ts`.
2. Merging an override file based on `NODE_ENV` (`dev`, `prod`, etc.).
3. Reading environment variables.

| Variable | Description | Default (`defaults.ts`) |
| --- | --- | --- |
| `NODE_ENV` | Selects the override file (`dev`, `prod`, `defaults`, etc.) | `defaults` |
| `APP_PORT` | Fastify listening port | `3000` |
| `APP_ADMIN_PASSWORD` | Initial admin password used by migration `0001_create_admin` | `change-me` |
| `JWT_SECRET` | Token signing key | `secretKey` |
| `DB_CONN_STRING` | MongoDB connection URI | `mongodb://fitdesk:password@localhost:27017/fitdesk?authSource=fitdesk` |
| `DB_NAME` | MongoDB database name | `fitdesk` |

Additional settings:
- `config.jwt.refreshTokenName` names the optional refresh-token cookie (not used by default).
- `config.graphQL.playground` and `config.graphQL.introspection` are disabled in production (`prod.ts`).
- `config.throttle` describes rate-limiting rules (not yet wired in the code).

### Minimal `.env` example
```ini
NODE_ENV=dev
APP_PORT=3000
DB_CONN_STRING=mongodb://localhost:27017/fitdesk
DB_NAME=fitdesk
JWT_SECRET=replace-me
APP_ADMIN_PASSWORD=replace-me
```

## Running the API
### Development (watch mode + playground)
```bash
npm run start:dev
```
- Runs `nest start --watch` with `NODE_ENV=dev` via `cross-env`.
- GraphQL Playground available at `http://localhost:3000/graphql`.
- Schema written to `docs/gqlschema.gql`.

### Direct execution (TypeScript entry point)
```bash
npm run start
```

### Production (build then run)
```bash
npm run build
npm run start:prod
```
- `npm run build` produces `dist/`.
- `npm run start:prod` executes `node .` (`dist/src/main.js`).
- Set `NODE_ENV=prod` to disable the playground and enable rotating file logs.

## Authentication and Roles
- `auth` mutation (see `docs/auth.http`) produces an access token:

```graphql
mutation Auth($input: AuthInput!) {
  auth(input: $input) {
    access_token
  }
}
```

- Initial admin credentials: `admin@fitdesk.com` with `APP_ADMIN_PASSWORD`.
- Send `Authorization: Bearer <token>` on protected operations.
- The `@Auth()` decorator applies `JwtAuthGuard` and `RolesGuard`. With no arguments it simply checks token validity; adding roles (`@Auth(Role.ADMIN)`) enforces role membership.
- Supported roles: `ADMIN`, `COACH`, `ATHLETE`.

## Seed Data and Migrations
- On startup, `BddServiceInitMongo` opens the MongoDB connection, sets `inversify.mongo`, and runs `MongoMigrationRunner`.
- Core migrations:
  - `0001_create_admin`: idempotent admin user creation with Argon2-hashed password drawn from `config.admin.password`.
  - `0002_seeds_muscle`: French muscle taxonomy.
  - `0003_seeds_equipment`, `0004_seeds_category`, `0005_seeds_exercise`, `0006_seeds_session`: additional catalog seeds linked to the admin user.
- Repositories ensure their indexes (uniqueness, sorting) during migration execution.
- GraphQL query `db_test` (admin role required) triggers a Mongo `ping` via `DbTestUsecase`.

## Logging
- Winston-based logger defined in `src/common/logger.ts`.
- Development: `debug` level with colorful console output.
- Production (`NODE_ENV=prod`): logs `info` and above rotated daily into `logs/apis-%DATE%.log` while keeping console output.
- NestJS logs are proxied through `NestLogger`.
- Errors can leverage `nestFormatterError.ts` for stack handling.

## Project Structure
```
src/
  app.module.ts            # Nest composition root
  main.ts                  # Fastify bootstrap + CORS + custom logger
  common/                  # Logger, error enums, helpers
  config/                  # Defaults + environment overrides
  graphql/                 # Resolvers, GraphQL DTOs, guards, decorators
  inversify/               # Application container and service wiring
  services/                # Crypto, JWT, Mongo repositories, migrations
  usecases/                # Domain use cases by feature
  types/                   # Utility types (DeepPartial)
docs/                      # REST Client / GraphQL request samples
Dockerfile                 # Multi-stage build (deps, build, runtime)
```

## Docker
- Multi-stage image based on `node:22-alpine`.
- Stages:
  1. `deps`: `npm ci`.
  2. `build`: TypeScript compilation.
  3. `runtime`: copy `dist` and `node_modules`, expose `3000`.
- Local build:

```bash
docker build -t draftdream-api .
docker run --rm -p 3000:3000 --env-file .env draftdream-api
```

Ensure the container can reach MongoDB (e.g., use `host.docker.internal` on Docker Desktop).

## Tests
The project has comprehensive test coverage using Jest 30 and ts-jest.

### Running Tests
```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage
```

### Test Statistics
- **133 test suites** with **544 passing tests**
- Test files located in `**/__tests__/**/*.spec.ts`
- Coverage includes:
  - **Use cases**: auth, athlete, client, nutri, sport modules
  - **GraphQL mappers**: category, equipment, exercise, meal, muscle, program, session, tag, user
  - **Common utilities**: error handling, slug generation

### Manual Testing
You can also use the `docs/*.http` collection or GraphQL Playground to manually exercise resolvers during development.

---

Questions or missing sections? Feel free to extend this README with additional operational notes, scripts, or CI/CD steps.
