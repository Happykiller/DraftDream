// src/hooks/prospects/useProspectListMetrics.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

import type { Prospect, ProspectSourceFilterValue } from '@app-types/prospects';
import { pipelineStatuses, ProspectStatus } from '@src/commons/prospects/status';
import { prospectList } from '@services/graphql/prospects.service';

const PAGE_SIZE = 200;

export interface ProspectListMetrics {
  totalProspects: number;
  clientCount: number;
  pipelineProspects: number;
  newClientsThisMonth: number;
}

interface UseProspectListMetricsParams {
  sourceFilter?: ProspectSourceFilterValue;
  enabled?: boolean;
}

interface UseProspectListMetricsState {
  loading: boolean;
  metrics: ProspectListMetrics;
}

function isValidDate(input: string): boolean {
  return !Number.isNaN(new Date(input).getTime());
}

function isWithinLastDays(date: string, days: number): boolean {
  if (!isValidDate(date)) return false;

  const differenceInMs = Date.now() - new Date(date).getTime();
  const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

  return differenceInDays <= days;
}

async function collectAllProspectsByStatus(
  status: ProspectStatus | null,
  sourceId?: string | null,
): Promise<Prospect[]> {
  const pages: Prospect[] = [];
  let page = 1;

  while (true) {
    const result = await prospectList({ page, limit: PAGE_SIZE, status, sourceId: sourceId ?? undefined });
    pages.push(...result.items);

    if (pages.length >= result.total || result.items.length === 0) {
      break;
    }

    page += 1;
  }

  return pages;
}

async function collectMissingSourceByStatus(status: ProspectStatus | null): Promise<Prospect[]> {
  const items = await collectAllProspectsByStatus(status, null);

  return items.filter((prospect) => !(prospect.source?.id ?? prospect.sourceId));
}

async function sumTotalsByStatuses(
  statuses: ProspectStatus[],
  sourceId?: string | null,
): Promise<number> {
  const results = await Promise.all(
    statuses.map((status) => prospectList({ page: 1, limit: 1, status, sourceId: sourceId ?? undefined })),
  );

  return results.reduce((total, result) => total + (result?.total ?? 0), 0);
}

/** Loads aggregate metrics for the prospect list header. */
export function useProspectListMetrics({
  sourceFilter = 'all',
  enabled = true,
}: UseProspectListMetricsParams = {}) {
  const [{ loading, metrics }, setState] = React.useState<UseProspectListMetricsState>({
    loading: false,
    metrics: {
      totalProspects: 0,
      clientCount: 0,
      pipelineProspects: 0,
      newClientsThisMonth: 0,
    },
  });
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);

  const load = React.useCallback(async () => {
    if (!enabled) {
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const resolveSourceId =
        typeof sourceFilter === 'string' && sourceFilter !== 'all' && sourceFilter !== 'none'
          ? sourceFilter
          : null;

      const nextMetrics = await execute(async () => {
        const [clientItems, totalProspects, pipelineProspects] = await (async () => {
          if (sourceFilter === 'none') {
            const statuses = [...pipelineStatuses, ProspectStatus.CLIENT];
            const statusCollections = await Promise.all(statuses.map((status) => collectMissingSourceByStatus(status)));
            const clientCollection = statusCollections[statusCollections.length - 1];
            const pipelineCollection = statusCollections.slice(0, -1).flat();

            return [clientCollection, statusCollections.flat(), pipelineCollection.length];
          }

          const clients = await collectAllProspectsByStatus(ProspectStatus.CLIENT, resolveSourceId);
          const totalProspectsResult = await prospectList({
            page: 1,
            limit: 1,
            sourceId: resolveSourceId ?? undefined,
          });
          const pipelineTotal = await sumTotalsByStatuses(pipelineStatuses, resolveSourceId);

          return [clients, totalProspectsResult.total, pipelineTotal];
        })();

        const newClientsThisMonth = clientItems.filter((prospect) =>
          isWithinLastDays(prospect.createdAt, 30),
        ).length;

        return {
          totalProspects: Array.isArray(totalProspects) ? totalProspects.length : totalProspects,
          clientCount: clientItems.length,
          pipelineProspects: Array.isArray(pipelineProspects) ? pipelineProspects.length : pipelineProspects,
          newClientsThisMonth,
        } satisfies ProspectListMetrics;
      });

      setState({ loading: false, metrics: nextMetrics });
    } catch (error) {
      console.error('[useProspectListMetrics] Failed to load prospect metrics', error);
      setState((prev) => ({ ...prev, loading: false }));
      flashError(t('prospects.notifications.load_failure'));
    }
  }, [enabled, execute, flashError, sourceFilter, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    metrics,
    loading,
    reload: load,
  } as const;
}
