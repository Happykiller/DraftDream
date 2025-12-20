// src/hooks/athletes/useAthleteInfo.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import type { AthleteInfo } from '@app-types/athleteInfo';

import {
  athleteInfoGetByUser,
  athleteInfoUpdate,
  type AthleteInfoUpdateInput,
} from '@services/graphql/athleteInfo.service';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

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
  update: (input: AthleteInfoUpdateInput) => Promise<AthleteInfo | null>;
}

/** Fetches athlete information for the current athlete profile. */
export function useAthleteInfo({
  userId,
  initialInfo = null,
  initialError = null,
}: UseAthleteInfoOptions = {}): UseAthleteInfoResult {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
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
          const message = t('athletes.details.athlete_info.load_failed');
          setAthleteInfo(null);
          setError(message);
          return null;
        }

        setAthleteInfo(result);
        return result;
      } catch (caught: unknown) {
        console.error('[useAthleteInfo] Failed to load athlete info', caught);
        const message = t('athletes.details.athlete_info.load_failed');
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

  const update = React.useCallback(
    async (input: AthleteInfoUpdateInput): Promise<AthleteInfo | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await execute(() => athleteInfoUpdate(input));

        if (!result) {
          const message = t('athlete_information.notifications.update_failure');
          setError(message);
          flashError(message);
          throw new Error(message);
        }

        setAthleteInfo(result);
        return result;
      } catch (caught: unknown) {
        console.error('[useAthleteInfo] Failed to update athlete info', caught);
        const message = t('athlete_information.notifications.update_failure');
        setError(message);
        flashError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, t],
  );

  return { athleteInfo, loading, error, reload, update };
}
