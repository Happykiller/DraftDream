# Changelog

## [0.11.1] - 2026-01-12

### Fixed
- **Stability**: Resolved critical "Rules of Hooks" violations in `MealRecordDetails` and `ProgramRecordDetails` by ensuring conditional logic does not prevent hook execution.
- **Reliability**: Fixed missing dependencies in `useEffect` and `useCallback` hooks in `AthleteNutritionWidget` and `AthleteProgramsWidget`, improving data consistency and effect stability.
- **Type Safety**:
    - Fixed undefined behavior in `AthleteCalendar` float parsing.
    - Resolved TypeScript union type errors in `AthleteCalendar` by refining loop logic and property accessors.

### Refactor
- **Code Quality**: Removed unused variables and optimized imports to satisfy "Zero Broken Windows" policy.
- **Performance**: Optimized memoization in `ProgramRecordDetails` to prevent unnecessary re-renders.

### CI/CD
- Codebase now passes all Linting, Type Checking, and Test suites.
