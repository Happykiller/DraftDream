// src/hooks/useClients.ts
// Comment in English: CRUD GraphQL hook for prospects/clients management.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface ClientRelation {
  id: string;
  label: string;
  slug?: string;
}

export interface ClientObjectiveRelation {
  id: string;
  label: string;
}

export interface ClientActivityPreferenceRelation {
  id: string;
  label: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  statusId?: string;
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
  status?: ClientRelation | null;
  level?: ClientRelation | null;
  source?: ClientRelation | null;
  objectives?: ClientObjectiveRelation[];
  activityPreferences?: ClientActivityPreferenceRelation[];
}

export interface ClientListResult {
  items: Client[];
  total: number;
  page: number;
  limit: number;
}

const CLIENT_FIELDS = `
  id
  firstName
  lastName
  email
  phone
  statusId
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
  status { id label slug }
  level { id label slug }
  source { id label slug }
  objectives { id label }
  activityPreferences { id label }
`;

const LIST_Q = `
  query ListClients($input: ListClientsInput) {
    client_list(input: $input) {
      items {
        ${CLIENT_FIELDS}
      }
      total
      page
      limit
    }
  }
`;

const CREATE_M = `
  mutation CreateClient($input: CreateClientInput!) {
    client_create(input: $input) {
      ${CLIENT_FIELDS}
    }
  }
`;

const UPDATE_M = `
  mutation UpdateClient($input: UpdateClientInput!) {
    client_update(input: $input) {
      ${CLIENT_FIELDS}
    }
  }
`;

const DELETE_M = `
  mutation DeleteClient($id: ID!) {
    client_delete(id: $id)
  }
`;

type ClientListPayload = { client_list: ClientListResult };
type CreateClientPayload = { client_create: Client | null };
type UpdateClientPayload = { client_update: Client | null };
type DeleteClientPayload = { client_delete: boolean };

export interface UseClientsParams {
  page: number; // 1-based
  limit: number;
  q: string;
  statusId?: string | null;
  levelId?: string | null;
  sourceId?: string | null;
}

export interface ClientCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  statusId?: string;
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

export interface ClientUpdateInput extends Partial<ClientCreateInput> {
  id: string;
}

export function useClients(params: UseClientsParams) {
  const { page, limit, q, statusId, levelId, sourceId } = params;
  const [items, setItems] = React.useState<Client[]>([]);
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
        gql.send<ClientListPayload>({
          query: LIST_Q,
          variables: {
            input: {
              page,
              limit,
              q: q || undefined,
              statusId: statusId || undefined,
              levelId: levelId || undefined,
              sourceId: sourceId || undefined,
            },
          },
          operationName: 'ListClients',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.client_list.items ?? []);
      setTotal(data?.client_list.total ?? 0);
    } catch (error: any) {
      flashError(error?.message ?? 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, levelId, limit, page, q, sourceId, statusId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: ClientCreateInput) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateClientPayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateClient',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Client created');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Create failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const update = React.useCallback(
    async (input: ClientUpdateInput) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateClientPayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateClient',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Client updated');
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
          gql.send<DeleteClientPayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteClient',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Client deleted');
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
