// src/hooks/useDailyReports.ts
// Comment in English: Fetch athlete daily reports with loader overlay support.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface DailyReportAthlete {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
}

export interface DailyReport {
  id: string;
  reportDate: string;
  trainingDone: boolean;
  nutritionPlanCompliance: number;
  nutritionDeviations: boolean;
  painZones: string[];
  athlete?: DailyReportAthlete | null;
}

interface DailyReportListPayload {
  dailyReport_list: {
    items: DailyReport[];
    total: number;
    page: number;
    limit: number;
  };
}

const LIST_Q = `
  query ListDailyReports($input: ListDailyReportsInput) {
    dailyReport_list(input: $input) {
      items {
        id
        reportDate
        trainingDone
        nutritionPlanCompliance
        nutritionDeviations
        painZones
        athlete {
          id
          first_name
          last_name
          email
        }
      }
      total
      page
      limit
    }
  }
`;

export interface UseDailyReportsParams {
  page: number;
  limit: number;
}

export function useDailyReports({ page, limit }: UseDailyReportsParams) {
  const [items, setItems] = React.useState<DailyReport[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(
    async (vars: { page: number; limit: number }) => {
      setLoading(true);
      try {
        const { data, errors } = await execute(() =>
          gql.send<DailyReportListPayload>({
            query: LIST_Q,
            variables: {
              input: {
                page: vars.page,
                limit: vars.limit,
              },
            },
            operationName: 'ListDailyReports',
          }),
        );

        if (errors?.length) throw new Error(errors[0].message);

        setItems(data?.dailyReport_list.items ?? []);
        setTotal(data?.dailyReport_list.total ?? 0);
      } catch (error: any) {
        flashError(error?.message ?? 'Failed to load daily reports');
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, gql],
  );

  const sig = `${page}|${limit}`;
  const lastSigRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastSigRef.current === sig) return;
    lastSigRef.current = sig;
    void load({ page, limit });
  }, [sig, load, page, limit]);

  const reload = React.useCallback(() => load({ page, limit }), [load, page, limit]);

  return {
    items,
    total,
    loading,
    reload,
  };
}
