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

export interface AthleteInfoMetadataItem {
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
  objectives?: AthleteInfoMetadataItem[];
  activityPreferences?: AthleteInfoMetadataItem[];
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
type AthleteInfoCreatePayload = {
  athleteInfo_create: AthleteInfo | null;
};
type AthleteInfoDeletePayload = {
  athleteInfo_delete: boolean;
};
type AthleteInfoGetPayload = {
  athleteInfo_get: AthleteInfo | null;
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
        objectives { id label }
        activityPreferences { id label }
      }
      total
      page
      limit
    }
  }
`;


const GET_Q = `
  query GetAthleteInfo($id: ID!) {
    athleteInfo_get(id: $id) {
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
      objectives { id label }
      activityPreferences { id label }
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

const CREATE_MUTATION = `
  mutation CreateAthleteInfo($input: CreateAthleteInfoInput!) {
    athleteInfo_create(input: $input) {
      id
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteAthleteInfo($id: ID!) {
    athleteInfo_delete(id: $id)
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

export interface AthleteInfoCreateInput {
  userId: string;
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

  const create = React.useCallback(
    async (input: AthleteInfoCreateInput) => {
      setLoading(true);
      try {
        const { errors } = await execute(() =>
          gql.send<AthleteInfoCreatePayload>({
            query: CREATE_MUTATION,
            variables: { input },
            operationName: 'CreateAthleteInfo',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Athlete information created');
        await load({ page, limit, q, includeArchived, userId });
      } catch (error: any) {
        flashError(error?.message ?? 'Failed to create athlete information');
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, flashSuccess, gql, includeArchived, limit, load, page, q, userId],
  );

  const remove = React.useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const { errors } = await execute(() =>
          gql.send<AthleteInfoDeletePayload>({
            query: DELETE_MUTATION,
            variables: { id },
            operationName: 'DeleteAthleteInfo',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Athlete information deleted');
        await load({ page, limit, q, includeArchived, userId });
      } catch (error: any) {
        flashError(error?.message ?? 'Failed to delete athlete information');
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, flashSuccess, gql, includeArchived, limit, load, page, q, userId],
  );



  const getAthleteInfo = React.useCallback(
    async (id: string): Promise<AthleteInfo | null> => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<AthleteInfoGetPayload>({
            query: GET_Q,
            variables: { id },
            operationName: 'GetAthleteInfo',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        return data?.athleteInfo_get ?? null;
      } catch (error: any) {
        flashError(error?.message ?? 'Failed to load athlete information details');
        return null;
      }
    },
    [execute, flashError, gql],
  );

  return {
    items,
    total,
    loading,
    create,
    update,
    remove,
    reload: () => load({ page, limit, q, includeArchived, userId }),
    getAthleteInfo,
  };
}
