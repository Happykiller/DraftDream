// src/hooks/athletes/useCoachAthletes.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import {
  coachAthleteList,
  type CoachAthleteListInput,
} from '@services/graphql/coachAthletes.service';
import type { CoachAthleteListResult } from '@app-types/coachAthletes';

export interface UseCoachAthletesParams extends Pick<CoachAthleteListInput, 'coachId' | 'page' | 'limit'> {
  includeArchived?: boolean;
}

interface UseCoachAthletesState extends CoachAthleteListResult {
  loading: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;

/** Hook responsible for loading coach-athlete links for the authenticated coach. */
export function useCoachAthletes({
  coachId,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  includeArchived = false,
}: UseCoachAthletesParams) {
  const [state, setState] = React.useState<UseCoachAthletesState>({
    items: [],
    total: 0,
    page,
    limit,
    loading: false,
  });
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((store) => store.error);
  const { t } = useTranslation();

  const load = React.useCallback(async () => {
    if (!coachId) {
      setState((prev) => ({ ...prev, items: [], total: 0 }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await execute(() =>
        coachAthleteList({ coachId, page, limit, includeArchived }),
      );
      setState({ ...result, loading: false });
    } catch (error) {
      console.error('[useCoachAthletes] Failed to load coach-athlete links', error);
      setState((prev) => ({ ...prev, loading: false }));
      flashError(t('athletes.notifications.load_failure'));
    }
  }, [coachId, execute, flashError, includeArchived, limit, page, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    items: state.items,
    total: state.total,
    loading: state.loading,
    reload: load,
  } as const;
}
