import type { Program } from '@hooks/programs/usePrograms';

export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

export function deriveProgramDifficulty(_program: Program): ProgramDifficulty | null {
  return null;
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
