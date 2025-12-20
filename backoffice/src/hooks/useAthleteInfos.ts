// src/hooks/useAthleteInfos.ts
// Comment in English: Fetch athlete profile records through athleteInfo_list with loader overlay support.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface AthleteInfoAddress {
  city?: string | null;
  country?: string | null;
}

export interface AthleteInfoCompany {
  name?: string | null;
}

export interface AthleteInfoAthlete {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  company?: AthleteInfoCompany | null;
  address?: AthleteInfoAddress | null;
  updatedAt?: string | null;
}

export interface AthleteInfoLevel {
  id: string;
  label?: string | null;
}

export interface AthleteInfo {
  id: string;
  userId: string;
  levelId?: string | null;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string | null;
  allergies?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  athlete?: AthleteInfoAthlete | null;
  level?: AthleteInfoLevel | null;
}

interface AthleteInfoListPayload {
  athleteInfo_list: {
    items: AthleteInfo[];
    total: number;
    page: number;
    limit: number;
  };
}

type AthleteInfoUpdatePayload = {
  athleteInfo_update: AthleteInfo | null;
};

const LIST_Q = `
  query ListAthleteInfos($input: ListAthleteInfosInput) {
    athleteInfo_list(input: $input) {
      items {
        id
        userId
        levelId
        objectiveIds
        activityPreferenceIds
        medicalConditions
        allergies
        notes
        createdBy
        createdAt
        updatedAt
        deletedAt
        athlete {
          id
          type
          first_name
          last_name
          email
          phone
          is_active
          company { name }
          address { city country }
          updatedAt
        }
        level { id label }
      }
      total
      page
      limit
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateAthleteInfo($input: UpdateAthleteInfoInput!) {
    athleteInfo_update(input: $input) {
      id
    }
  }
`;

export interface UseAthleteInfosParams {
  page: number;
  limit: number;
  q?: string;
  includeArchived?: boolean;
  userId?: string | null;
}

export interface AthleteInfoUpdateInput {
  id: string;
  userId?: string;
  levelId?: string | null;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string | null;
  allergies?: string | null;
  notes?: string | null;
}

export function useAthleteInfos({ page, limit, q, includeArchived, userId }: UseAthleteInfosParams) {
  const [items, setItems] = React.useState<AthleteInfo[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(
    async (vars: { page: number; limit: number; q?: string; includeArchived?: boolean; userId?: string | null }) => {
      setLoading(true);
      try {
        const { data, errors } = await execute(() =>
          gql.send<AthleteInfoListPayload>({
            query: LIST_Q,
            variables: {
              input: {
                page: vars.page,
                limit: vars.limit,
                q: vars.q || undefined,
                includeArchived: vars.includeArchived,
                userId: vars.userId || undefined,
              },
            },
            operationName: 'ListAthleteInfos',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        setItems(data?.athleteInfo_list.items ?? []);
        setTotal(data?.athleteInfo_list.total ?? 0);
      } catch (error: any) {
        flashError(error?.message ?? 'Failed to load athlete information');
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, gql],
  );

  const lastSigRef = React.useRef<string | null>(null);
  const sig = `${page}|${limit}|${q || ''}|${includeArchived ? '1' : '0'}|${userId || ''}`;

  React.useEffect(() => {
    if (lastSigRef.current === sig) return;
    lastSigRef.current = sig;
    void load({ page, limit, q, includeArchived, userId });
  }, [sig, load, page, limit, q, includeArchived, userId]);

  const update = React.useCallback(
    async (input: AthleteInfoUpdateInput) => {
      setLoading(true);
      try {
        const { errors } = await execute(() =>
          gql.send<AthleteInfoUpdatePayload>({
            query: UPDATE_MUTATION,
            variables: { input },
            operationName: 'UpdateAthleteInfo',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Athlete information updated');
        await load({ page, limit, q, includeArchived, userId });
      } catch (error: any) {
        flashError(error?.message ?? 'Failed to update athlete information');
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, flashSuccess, gql, includeArchived, limit, load, page, q, userId],
  );

  return {
    items,
    total,
    loading,
    update,
    reload: () => load({ page, limit, q, includeArchived, userId }),
  };
}
