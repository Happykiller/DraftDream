// src/hooks/useProgram.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { programGet } from '@services/graphql/programs.service';

import type { Program } from '@hooks/programs/usePrograms';

import { useAsyncTask } from '@hooks/useAsyncTask';

export interface UseProgramOptions {
  programId?: string | null;
  initialProgram?: Program | null;
  initialError?: string | null;
}

export interface UseProgramResult {
  program: Program | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<Program | null>;
}

/**
 * Fetches a single program with loader-aware status tracking.
 */
export function useProgram({
  programId,
  initialProgram = null,
  initialError = null,
}: UseProgramOptions = {}): UseProgramResult {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const [program, setProgram] = React.useState<Program | null>(initialProgram);
  const [error, setError] = React.useState<string | null>(initialError);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(
    async (idToLoad: string): Promise<Program | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await execute(() => programGet({ programId: idToLoad }));

        if (!result) {
          const message = t('programs-details.errors.not_found');
          setProgram(null);
          setError(message);
          return null;
        }

        setProgram(result);
        return result;
      } catch (caught: unknown) {
        console.error('[useProgram] Failed to load program', caught);
        const message = t('programs-details.errors.load_failed');
        setProgram(null);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [execute, t],
  );

  React.useEffect(() => {
    setProgram(initialProgram);
  }, [initialProgram]);

  React.useEffect(() => {
    setError(initialError);
  }, [initialError]);

  React.useEffect(() => {
    if (!programId) {
      setProgram(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (initialProgram && initialProgram.id === programId) {
      setLoading(false);
      return;
    }

    if (initialError) {
      setLoading(false);
      return;
    }

    void load(programId);
  }, [initialError, initialProgram, load, programId]);

  const reload = React.useCallback(async () => {
    if (!programId) {
      setProgram(null);
      setError(null);
      return null;
    }

    return load(programId);
  }, [load, programId]);

  return { program, loading, error, reload };
}
