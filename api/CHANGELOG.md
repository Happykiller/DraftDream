# Changelog

## [0.7.0] - 2025-11-02
- todo

## [0.6.0] - 2025-10-25
- Increase minor version to prepare the next API release.
- Add rate limiting safeguards for public endpoints to mitigate abuse.
- Expand player draft analytics export to include advanced metrics.
- Harden authentication workflow with refresh token rotation support.
- Improve observability by centralizing audit logging streams.
- Update dependency stack to align with shared service baselines.

## [0.5.0] - 2025-10-25
- Initialize change tracking for the API service.

## [0.4.0] - 2025-10-15
- Introduce meal, meal type, meal day, and meal plan entities with complete CRUD capabilities across the nutrition domain.
- Adjust GraphQL schema metadata, unify mutation return payloads, and mark nullable relations to support nutrition management flows.
- Expand unit test coverage across user, session, program, exercise, category, meal, muscle, and plan use cases to secure regressions.
- Refine the Jest configuration so local and CI runs deliver consistent, reliable feedback.

