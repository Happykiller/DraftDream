# API Release Readiness Review - Pass 1 (Theoretical)

## Goal
Prepare a production hardening pass for the API stack by identifying high-risk issues through static code and rules review when build/lint/tests cannot be executed in the current environment.

## Scope covered
- Architecture and layering consistency (hexagonal boundaries).
- Authorization and visibility rule consistency.
- Error-handling reliability patterns in use cases.
- Operational readiness checklist alignment.

## Constraints
The following quality gates were **not executable** in this pass:
- `npm run lint`
- `npm run build`
- Unit/integration tests

This review is therefore focused on theoretical/static verification.

## Static checks executed
1. Located and read project instructions:
   - root `AGENTS.md`
   - `api/AGENT.MD`
2. Scanned `src/usecases` for `execute` methods missing the required `try/catch` normalization pattern.
3. Searched for forbidden `hybrid` visibility in API source and docs.
4. Reviewed representative use cases for deletion/authorization flows.

## Findings

### HIGH - Missing normalized error boundary in multiple use cases
The API agent rules require `execute` methods to be wrapped in `try/catch`, logging through `this.inversify.loggerService.error`, and rethrowing normalized errors.

A static scan found multiple use cases where `execute` has no `try/catch`, especially around hard-delete flows and one soft-delete flow (`delete.program-record`).

**Risk in production**
- Unnormalized exceptions can leak inconsistent error semantics to GraphQL consumers.
- Logging may be incomplete or inconsistent during incidents.
- Operational troubleshooting time increases under failure conditions.

**Priority actions**
- Batch-refactor affected use cases to enforce the standard `try/catch + normalizeError` pattern.
- Add unit tests covering not-found, unauthorized, and storage failure paths for each delete use case.

### HIGH - Raw domain errors still thrown in business flows
Representative files still throw raw `Error('..._NOT_FOUND')` instead of normalized/domain-safe error objects.

**Risk in production**
- Error contract instability for clients.
- Reduced observability consistency.

**Priority actions**
- Replace raw `Error` throws with normalized errors from centralized error utilities.
- Validate GraphQL error mapping remains deterministic.

### PASS - No `hybrid` visibility detected in API source/docs scan
The static search did not find occurrences of deprecated `hybrid` visibility in `src`, `docs`, or `README.md`.

## Recommended release-hardening plan (next pass)
1. **Reliability sprint (blocking)**
   - Normalize error handling in all flagged use cases.
   - Add focused unit tests for delete and hard-delete business rules.
2. **Security and authorization validation (blocking)**
   - Verify admin-only hard-delete behavior in resolver + usecase paths.
   - Verify owner/admin checks for all soft-delete/update operations.
3. **Production readiness verification (mandatory when environment allows)**
   - Run lint/build/tests.
   - Regenerate GraphQL schema if relevant changes occur.

## Exit criteria for API release candidate
- Zero use case `execute` methods without standardized error normalization.
- Delete/hard-delete unit tests passing for ownership and role edge cases.
- Lint/build/tests green.
- Documentation updated for any changed behavior.

## Appendix - Files flagged by static scan (missing try/catch in execute)
- `src/usecases/athlete/coach-athlete/hard-delete.coach-athlete.usecase.ts`
- `src/usecases/nutri/meal/hard-delete.meal.usecase.ts`
- `src/usecases/nutri/meal-day/hard-delete.meal-day.usecase.ts`
- `src/usecases/nutri/meal-plan/hard-delete.meal-plan.usecase.ts`
- `src/usecases/nutri/meal-type/hard-delete.meal-type.usecase.ts`
- `src/usecases/prospect/activity-preference/hard-delete.prospect-activity-preference.usecase.ts`
- `src/usecases/prospect/hard-delete.prospect.usecase.ts`
- `src/usecases/prospect/level/hard-delete.prospect-level.usecase.ts`
- `src/usecases/prospect/objective/hard-delete.prospect-objective.usecase.ts`
- `src/usecases/prospect/source/hard-delete.prospect-source.usecase.ts`
- `src/usecases/sport/category/hard-delete.category.usecase.ts`
- `src/usecases/sport/equipment/hard-delete.equipment.usecase.ts`
- `src/usecases/sport/exercise/hard-delete.exercise.usecase.ts`
- `src/usecases/sport/muscle/hard-delete.muscle.usecase.ts`
- `src/usecases/sport/program/hard-delete.program.usecase.ts`
- `src/usecases/sport/program-record/delete.program-record.usecase.ts`
- `src/usecases/sport/program-record/hard-delete.program-record.usecase.ts`
- `src/usecases/sport/session/hard-delete.session.usecase.ts`
- `src/usecases/tag/hard-delete.tag.usecase.ts`
