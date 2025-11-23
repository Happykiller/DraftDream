// src/hooks/prospects/useProspectPipeline.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { prospectList } from '@services/graphql/prospects.service';
import type { Prospect } from '@app-types/prospects';
import { pipelineStatuses } from '@src/commons/prospects/status';

type PipelineStatus = (typeof pipelineStatuses)[number];

interface UseProspectPipelineState {
  loading: boolean;
  prospectsByStatus: Record<PipelineStatus, Prospect[]>;
}

interface UseProspectPipelineParams {
  limit?: number;
  enabled?: boolean;
}

const EMPTY_PIPELINE_STATE: Record<PipelineStatus, Prospect[]> = pipelineStatuses.reduce(
  (acc, status) => ({ ...acc, [status]: [] as Prospect[] }),
  {} as Record<PipelineStatus, Prospect[]>,
);

/** Loads prospects grouped by status to feed the pipeline view. */
export function useProspectPipeline({ limit = 200, enabled = true }: UseProspectPipelineParams = {}) {
  const [{ loading, prospectsByStatus }, setState] = React.useState<UseProspectPipelineState>({
    loading: false,
    prospectsByStatus: EMPTY_PIPELINE_STATE,
  });
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const { t } = useTranslation();

  const load = React.useCallback(async () => {
    if (!enabled) {
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const results = await execute(() =>
        Promise.all(
          pipelineStatuses.map((status) => prospectList({ page: 1, limit, status })),
        ),
      );
      const grouped = pipelineStatuses.reduce((acc, status, index) => {
        acc[status] = results[index].items;
        return acc;
      }, {} as Record<PipelineStatus, Prospect[]>);
      setState({ loading: false, prospectsByStatus: grouped });
    } catch (error) {
      console.error('[useProspectPipeline] Failed to fetch prospect pipeline', error);
      setState((prev) => ({ ...prev, loading: false }));
      flashError(t('prospects.notifications.load_failure'));
    }
  }, [enabled, execute, flashError, limit, t]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }
    void load();
  }, [enabled, load]);

  return {
    prospectsByStatus,
    loading,
    reload: load,
  } as const;
}
