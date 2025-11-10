import type { TFunction } from 'i18next';

import type {
  Program,
  ProgramSessionExercise,
} from '@hooks/programs/usePrograms';

export type ProgramViewTab = 'overview' | 'sessions';

/**
 * Compute the athlete display label for a program.
 */
export function getProgramAthleteLabel(program: Program): string | null {
  if (!program.athlete) {
    return null;
  }

  const { first_name: firstName, last_name: lastName, email } = program.athlete;
  const displayName = [firstName, lastName]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ')
    .trim();

  return displayName || email || null;
}

/**
 * Format a duration in minutes into a localized label.
 */
export function formatProgramDurationLabel(
  totalMinutes: number,
  t: TFunction<'translation'>,
): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return t('programs-coatch.view.durations.not_available');
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return t('programs-coatch.view.durations.hours_minutes', { hours, minutes });
  }

  if (hours > 0) {
    return t('programs-coatch.view.durations.hours', { count: hours });
  }

  return t('programs-coatch.view.durations.minutes', { count: minutes });
}

/**
 * Derive a concise summary describing the effort for a program exercise.
 */
export function summarizeExerciseEffort(exercise: ProgramSessionExercise): string {
  const hasSeries = Boolean(exercise.series);
  const hasRepetitions = Boolean(exercise.repetitions);

  if (!hasSeries && !hasRepetitions) {
    return String(exercise.series || exercise.repetitions || '');
  }

  if (hasSeries && hasRepetitions) {
    return `${exercise.series} × ${exercise.repetitions}`;
  }

  return String(exercise.series ?? exercise.repetitions ?? '');
}
