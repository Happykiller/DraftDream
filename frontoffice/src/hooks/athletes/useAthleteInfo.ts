// src/hooks/athletes/useAthleteInfo.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import type { AthleteInfo } from '@app-types/athleteInfo';

import { athleteInfoGetByUser } from '@services/graphql/athleteInfo.service';

import { useAsyncTask } from '@hooks/useAsyncTask';

export interface UseAthleteInfoOptions {
  userId?: string | null;
  initialInfo?: AthleteInfo | null;
  initialError?: string | null;
}

export interface UseAthleteInfoResult {
  athleteInfo: AthleteInfo | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<AthleteInfo | null>;
}

/** Fetches athlete information for the current athlete profile. */
export function useAthleteInfo({
  userId,
  initialInfo = null,
  initialError = null,
}: UseAthleteInfoOptions = {}): UseAthleteInfoResult {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const [athleteInfo, setAthleteInfo] = React.useState<AthleteInfo | null>(initialInfo);
  const [error, setError] = React.useState<string | null>(initialError);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(
    async (id: string): Promise<AthleteInfo | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await execute(() => athleteInfoGetByUser({ userId: id }));

        if (!result) {
          const message = t('athletes.details.objectives.load_failed');
          setAthleteInfo(null);
          setError(message);
          return null;
        }

        setAthleteInfo(result);
        return result;
      } catch (caught: unknown) {
        console.error('[useAthleteInfo] Failed to load athlete info', caught);
        const message = t('athletes.details.objectives.load_failed');
        setAthleteInfo(null);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [execute, t],
  );

  React.useEffect(() => {
    setAthleteInfo(initialInfo);
  }, [initialInfo]);

  React.useEffect(() => {
    setError(initialError);
  }, [initialError]);

  React.useEffect(() => {
    if (!userId) {
      setAthleteInfo(null);
      setError(null);
      setLoading(false);
      return;
    }

    void load(userId);
  }, [userId, load]);

  const reload = React.useCallback(async () => {
    if (!userId) {
      setAthleteInfo(null);
      setError(null);
      return null;
    }

    return load(userId);
  }, [userId, load]);

  return { athleteInfo, loading, error, reload };
}
