// src/hooks/prospects/useProspects.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import {
  prospectCreate,
  prospectDelete,
  prospectList,
  prospectUpdate,
  type ProspectCreateInput,
  type ProspectListInput,
  type ProspectUpdateInput,
} from '@services/graphql/prospects.service';
import type { ProspectListResult } from '@app-types/prospects';
import type { ProspectStatusEnum } from '@src/commons/prospects/status';

export interface UseProspectsParams extends Pick<ProspectListInput, 'page' | 'limit'> {
  q?: string;
  status?: ProspectStatusEnum | null;
  levelId?: string | null;
  sourceId?: string | null;
}

interface UseProspectsState extends ProspectListResult {
  loading: boolean;
}

/** Centralized CRUD hook for prospect listings inside the front office. */
export function useProspects({ page, limit, q, status, levelId, sourceId }: UseProspectsParams) {
  const [{ items, total, loading }, setState] = React.useState<UseProspectsState>({
    items: [],
    total: 0,
    page,
    limit,
    loading: false,
  });
  const { execute } = useAsyncTask();
  const flashSuccess = useFlashStore((state) => state.success);
  const flashError = useFlashStore((state) => state.error);
  const { t } = useTranslation();

  const load = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await execute(() =>
        prospectList({ page, limit, q, status, levelId, sourceId }),
      );
      setState({ ...result, loading: false });
    } catch (error) {
      console.error('[useProspects] Failed to fetch prospects', error);
      setState((prev) => ({ ...prev, loading: false }));
      flashError(t('prospects.notifications.load_failure'));
    }
  }, [execute, flashError, levelId, limit, page, q, sourceId, status, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: ProspectCreateInput) => {
      try {
        await execute(() => prospectCreate(input));
        flashSuccess(t('prospects.notifications.create_success'));
        await load();
      } catch (error) {
        console.error('[useProspects] Failed to create prospect', error);
        flashError(t('prospects.notifications.create_failure'));
        throw error;
      }
    },
    [execute, flashError, flashSuccess, load, t],
  );

  const update = React.useCallback(
    async (input: ProspectUpdateInput) => {
      try {
        await execute(() => prospectUpdate(input));
        flashSuccess(t('prospects.notifications.update_success'));
        await load();
      } catch (error) {
        console.error('[useProspects] Failed to update prospect', error);
        flashError(t('prospects.notifications.update_failure'));
        throw error;
      }
    },
    [execute, flashError, flashSuccess, load, t],
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        await execute(() => prospectDelete(id));
        flashSuccess(t('prospects.notifications.delete_success'));
        await load();
      } catch (error) {
        console.error('[useProspects] Failed to delete prospect', error);
        flashError(t('prospects.notifications.delete_failure'));
        throw error;
      }
    },
    [execute, flashError, flashSuccess, load, t],
  );

  return {
    items,
    total,
    loading,
    reload: load,
    create,
    update,
    remove,
  } as const;
}
