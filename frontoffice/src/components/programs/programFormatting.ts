import type { Program } from '@hooks/programs/usePrograms';

export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_PRIORITY: ProgramDifficulty[] = ['advanced', 'intermediate', 'beginner'];

function normalizeDifficulty(level?: string | null): ProgramDifficulty | null {
  if (!level) {
    return null;
  }

  const normalized = level.toLowerCase();

  if (normalized === 'beginner' || normalized === 'intermediate' || normalized === 'advanced') {
    return normalized;
  }

  return null;
}

export function deriveProgramDifficulty(program: Program): ProgramDifficulty | null {
  const difficulty = program.sessions
    .flatMap((session) => session.exercises)
    .map((exercise) => normalizeDifficulty(exercise.level))
    .filter((level): level is ProgramDifficulty => Boolean(level))
    .sort((a, b) => DIFFICULTY_PRIORITY.indexOf(a) - DIFFICULTY_PRIORITY.indexOf(b));

  return difficulty[0] ?? null;
}

export function formatProgramDate(value: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}
