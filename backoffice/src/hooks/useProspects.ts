// src/hooks/useProspects.ts
// Comment in English: CRUD GraphQL hook for prospects management.
import * as React from 'react';

import inversify from '@src/commons/inversify';
import { ProspectStatusEnum } from '@src/commons/prospects/status';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface ProspectRelation {
  id: string;
  label: string;
  slug?: string;
}

export interface ProspectObjectiveRelation {
  id: string;
  label: string;
}

export interface ProspectActivityPreferenceRelation {
  id: string;
  label: string;
}

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: ProspectStatusEnum | null;
  levelId?: string;
  sourceId?: string;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  budget?: number;
  dealDescription?: string;
  desiredStartDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
  level?: ProspectRelation | null;
  source?: ProspectRelation | null;
  objectives?: ProspectObjectiveRelation[];
  activityPreferences?: ProspectActivityPreferenceRelation[];
}

export interface ProspectListResult {
  items: Prospect[];
  total: number;
  page: number;
  limit: number;
}

const PROSPECT_FIELDS = `
  id
  firstName
  lastName
  email
  phone
  status
  levelId
  sourceId
  objectiveIds
  activityPreferenceIds
  medicalConditions
  allergies
  notes
  budget
  dealDescription
  desiredStartDate
  createdBy
  createdAt
  updatedAt
  creator { id email }
  level { id label slug }
  source { id label slug }
  objectives { id label }
  activityPreferences { id label }
`;

const LIST_Q = `
  query ListProspects($input: ListProspectsInput) {
    prospect_list(input: $input) {
      items {
        ${PROSPECT_FIELDS}
      }
      total
      page
      limit
    }
  }
`;

const CREATE_M = `
  mutation CreateProspect($input: CreateProspectInput!) {
    prospect_create(input: $input) {
      ${PROSPECT_FIELDS}
    }
  }
`;

const UPDATE_M = `
  mutation UpdateProspect($input: UpdateProspectInput!) {
    prospect_update(input: $input) {
      ${PROSPECT_FIELDS}
    }
  }
`;

const DELETE_M = `
  mutation DeleteProspect($id: ID!) {
    prospect_delete(id: $id)
  }
`;

type ProspectListPayload = { prospect_list: ProspectListResult };
type CreateProspectPayload = { prospect_create: Prospect | null };
type UpdateProspectPayload = { prospect_update: Prospect | null };
type DeleteProspectPayload = { prospect_delete: boolean };

export interface UseProspectsParams {
  page: number; // 1-based
  limit: number;
  q: string;
  status?: ProspectStatusEnum | null;
  levelId?: string | null;
  sourceId?: string | null;
}

export interface ProspectCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: ProspectStatusEnum;
  levelId?: string;
  sourceId?: string;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  budget?: number;
  dealDescription?: string;
  desiredStartDate?: string;
}

export interface ProspectUpdateInput extends Partial<ProspectCreateInput> {
  id: string;
}

export function useProspects(params: UseProspectsParams) {
  const { page, limit, q, status, levelId, sourceId } = params;
  const [items, setItems] = React.useState<Prospect[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);

  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<ProspectListPayload>({
          query: LIST_Q,
          variables: {
            input: {
              page,
              limit,
              q: q || undefined,
              status: status || undefined,
              levelId: levelId || undefined,
              sourceId: sourceId || undefined,
            },
          },
          operationName: 'ListProspects',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.prospect_list.items ?? []);
      setTotal(data?.prospect_list.total ?? 0);
    } catch (error: any) {
      flashError(error?.message ?? 'Failed to load prospects');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, levelId, limit, page, q, sourceId, status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: ProspectCreateInput) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateProspectPayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateProspect',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Prospect created');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Create failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const update = React.useCallback(
    async (input: ProspectUpdateInput) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateProspectPayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateProspect',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Prospect updated');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Update failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeleteProspectPayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteProspect',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Prospect deleted');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Delete failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  return { items, total, loading, create, update, remove };
}
