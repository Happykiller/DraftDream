// src/hooks/clients/useClients.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import {
  clientCreate,
  clientDelete,
  clientList,
  clientUpdate,
  type ClientCreateInput,
  type ClientListInput,
  type ClientUpdateInput,
} from '@services/graphql/clients.service';
import type { ClientListResult } from '@app-types/clients';

export interface UseClientsParams extends Pick<ClientListInput, 'page' | 'limit'> {
  q?: string;
  statusId?: string | null;
  levelId?: string | null;
  sourceId?: string | null;
}

interface UseClientsState extends ClientListResult {
  loading: boolean;
}

/** Centralized CRUD hook for client listings inside the front office. */
export function useClients({ page, limit, q, statusId, levelId, sourceId }: UseClientsParams) {
  const [{ items, total, loading }, setState] = React.useState<UseClientsState>({
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
        clientList({ page, limit, q, statusId, levelId, sourceId }),
      );
      setState({ ...result, loading: false });
    } catch (error) {
      console.error('[useClients] Failed to fetch clients', error);
      setState((prev) => ({ ...prev, loading: false }));
      flashError(t('clients.notifications.load_failure'));
    }
  }, [execute, flashError, levelId, limit, page, q, sourceId, statusId, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: ClientCreateInput) => {
      try {
        await execute(() => clientCreate(input));
        flashSuccess(t('clients.notifications.create_success'));
        await load();
      } catch (error) {
        console.error('[useClients] Failed to create client', error);
        flashError(t('clients.notifications.create_failure'));
        throw error;
      }
    },
    [execute, flashError, flashSuccess, load, t],
  );

  const update = React.useCallback(
    async (input: ClientUpdateInput) => {
      try {
        await execute(() => clientUpdate(input));
        flashSuccess(t('clients.notifications.update_success'));
        await load();
      } catch (error) {
        console.error('[useClients] Failed to update client', error);
        flashError(t('clients.notifications.update_failure'));
        throw error;
      }
    },
    [execute, flashError, flashSuccess, load, t],
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        await execute(() => clientDelete(id));
        flashSuccess(t('clients.notifications.delete_success'));
        await load();
      } catch (error) {
        console.error('[useClients] Failed to delete client', error);
        flashError(t('clients.notifications.delete_failure'));
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
