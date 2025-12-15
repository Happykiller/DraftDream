// src/hooks/athletes/useCoachAthleteLink.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { coachAthleteGet } from '@services/graphql/coachAthletes.service';

import type { CoachAthleteLink } from '@app-types/coachAthletes';

import { useAsyncTask } from '@hooks/useAsyncTask';

export interface UseCoachAthleteLinkOptions {
  linkId?: string | null;
  initialLink?: CoachAthleteLink | null;
  initialError?: string | null;
}

export interface UseCoachAthleteLinkResult {
  link: CoachAthleteLink | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<CoachAthleteLink | null>;
}

/**
 * Fetches a single coach-athlete link with loader-aware defaults and error handling.
 */
export function useCoachAthleteLink({
  linkId,
  initialLink = null,
  initialError = null,
}: UseCoachAthleteLinkOptions = {}): UseCoachAthleteLinkResult {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const [link, setLink] = React.useState<CoachAthleteLink | null>(initialLink);
  const [error, setError] = React.useState<string | null>(initialError);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(
    async (identifier: string): Promise<CoachAthleteLink | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await execute(() => coachAthleteGet({ linkId: identifier }));

        if (!result) {
          const message = t('athletes.details.errors.not_found');
          setLink(null);
          setError(message);
          return null;
        }

        setLink(result);
        return result;
      } catch (caught: unknown) {
        console.error('[useCoachAthleteLink] Failed to load coach-athlete link', caught);
        const message = t('athletes.details.errors.load_failed');
        setLink(null);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [execute, t],
  );

  React.useEffect(() => {
    setLink(initialLink);
  }, [initialLink]);

  React.useEffect(() => {
    setError(initialError);
  }, [initialError]);

  React.useEffect(() => {
    if (!linkId) {
      setLink(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (initialLink && initialLink.id === linkId) {
      setLoading(false);
      return;
    }

    if (initialError) {
      setLoading(false);
      return;
    }

    void load(linkId);
  }, [initialError, initialLink, linkId, load]);

  const reload = React.useCallback(async () => {
    if (!linkId) {
      setLink(null);
      setError(null);
      return null;
    }

    return load(linkId);
  }, [linkId, load]);

  return { link, loading, error, reload };
}
