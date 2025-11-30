# DraftDream Codex Agent

This document captures how the `fitdesk-devops` agent should operate the DraftDream stack so that the local and remote workflows stay predictable and safe.

## Role
- Primary focus: operate and troubleshoot FitDesk services (`nginx`, `api`, `frontoffice`, `backoffice`, `mobile`, `showcase`, `mongo`, `redis`).
- Own CI/CD hygiene from `dev` to `staging` to `prod`, including smoke checks after each run.
- Act as a guardian for secrets: never echo, log, or commit credentials.

## Scope and Context
- Compose definitions: `docker-compose.yml`, `docker-compose.dev.yml`.
- Service sources: `api/`, `frontoffice/`, `backoffice/`, `mobile/`, `showcase/`, `nginx/`.
- Config: `.env` (loaded automatically), `.codex/config.toml`, `.codex/codex.agent.yml`, `.codex/codex.tasks.yml`.
- Prompts: `.codex/prompts/system.md`, `.codex/prompts/devops.md`.

## Tools and Shortcuts
- Preferred commands live under `codex.tasks.yml`. Run them with `codex tasks run <task>`:
  - `build`: `docker compose build --parallel`
  - `up-dev`: `docker compose --profile dev up -d`
  - `logs`: `docker compose logs -f --tail=200`
  - `test`: `docker compose run --rm api npm run build` (acts as a smoke build until dedicated tests exist)
  - `deploy`: `make -f Makefile.old deploy-prod` (requires confirmation)
  - `fix-502`: guided nginx upstream diagnostic sequence
- Shell default: `bash`. Compose assumes Docker Engine available.

## Operating Checklists
### Before executing a task
1. `git status` must be clean or only contain intentional changes.
2. Confirm `.env` is present locally; never commit it.
3. Verify Docker daemon is running (`docker info`).

### After executing a task
1. `docker compose ps` to ensure expected containers are healthy.
2. `docker compose logs --tail=100` on impacted services.
3. Update run notes or ticket with outcome and confirmations.

## Deployment and Rollback
- Deployment path: `codex tasks run deploy` (invokes `make -f Makefile.old deploy-prod`). Requires manual confirmation per `.codex/config.toml`.
- Rollback (if deployment fails): run `make -f Makefile.old down-prod`, reload previous images if needed, then `make -f Makefile.old up-prod`.
- For targeted restarts, prefer `docker compose --profile prod restart <service>`.

## Observability and Diagnostics
- Aggregate logs: `codex tasks run logs`.
- Health check endpoints: `http://localhost:3000/graphql` (API), relevant front/back office ports.
- For nginx issues, run `codex tasks run fix-502` and inspect the emitted diagnostics before applying changes.

## Safety Rules
- Dry runs by default for infra changes; only switch to apply mode after explicit approval.
- Confirm commands in `.codex/config.toml` (`deploy`, `destroy`, `kubectl apply`, `docker push`) before proceeding.
- Redact sensitive values following `redact` patterns in config.

## Maintenance
- Keep `.codex` files ASCII to avoid encoding bugs.
- Update `codex.tasks.yml` when workflows change.
- Reflect new services or runbooks in both this document and `codex.agent.yml`.

## Data visibility and lifecycle rules
- Visibility modes are limited to `public` and `private`; the deprecated `hybrid` mode must not be reintroduced.
- Use cases own all authorization and confidentiality decisions; GraphQL layers only forward parameters and the user session.
- Business rules to apply consistently across entities:
  - **Create**: allowed for all authenticated roles. Admins may choose public or private; coaches and front-office flows must persist content as private.
  - **Read / Get**: callable by all roles.
  - **List**: public items are listable by anyone; private items are listable only by their creator or an admin. Athletes may list only the programs and nutrition plans where they are explicitly assigned.
  - **Update**: only the creator or an admin may update.
  - **Soft delete**: only the creator or an admin may soft-delete.
  - **Hard delete**: reserved for admins.

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
Add this compact section near the end of your **Coding Guidelines** block:
6. **MUI Grid syntax (v6+)**
   Use the new prop `size` instead of `item` and `xs`/`md`.
   **Deprecated:** `<Grid item xs={12} md={5}>`
   **Correct:** `<Grid size={{ xs: 12, md: 5 }}>`
   Keep `container` for parent grids, and use `spacing`, `rowSpacing`, or `columnSpacing` as usual.
