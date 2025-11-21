// src/hooks/useClientObjectives.ts
// Comment in English: Full CRUD hook for client objectives (prospects section).
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ClientObjectiveVisibility = 'PRIVATE' | 'PUBLIC';

export interface ClientObjective {
  id: string;
  slug: string;
  label: string;
  locale: string;
  visibility: ClientObjectiveVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type ClientObjectiveListPayload = {
  clientObjective_list: {
    items: ClientObjective[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateClientObjectivePayload = { clientObjective_create: ClientObjective };
type UpdateClientObjectivePayload = { clientObjective_update: ClientObjective };
type DeleteClientObjectivePayload = { clientObjective_delete: boolean };

const LIST_Q = `
  query ListClientObjectives($input: ListClientObjectivesInput) {
    clientObjective_list(input: $input) {
      items {
        id
        slug
        label
        locale
        visibility
        createdBy
        creator { id email }
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;

const CREATE_M = `
  mutation CreateClientObjective($input: CreateClientObjectiveInput!) {
    clientObjective_create(input: $input) {
      id
      slug
      label
      locale
      visibility
      createdBy
      creator { id email }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateClientObjective($input: UpdateClientObjectiveInput!) {
    clientObjective_update(input: $input) {
      id
      slug
      label
      locale
      visibility
      createdBy
      creator { id email }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_M = `
  mutation DeleteClientObjective($id: ID!) {
    clientObjective_delete(id: $id)
  }
`;

export interface UseClientObjectivesParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useClientObjectives({ page, limit, q }: UseClientObjectivesParams) {
  const [items, setItems] = React.useState<ClientObjective[]>([]);
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
        gql.send<ClientObjectiveListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListClientObjectives',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.clientObjective_list.items ?? []);
      setTotal(data?.clientObjective_list.total ?? 0);
    } catch (e: any) {
      flashError(e?.message ?? 'Failed to load objectives');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: { label: string; locale: string; visibility: ClientObjectiveVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateClientObjectivePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateClientObjective',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Objective created');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const update = React.useCallback(
    async (input: {
      id: string;
      label?: string;
      locale?: string;
      visibility?: ClientObjectiveVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateClientObjectivePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateClientObjective',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Objective updated');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Update failed');
        throw e;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeleteClientObjectivePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteClientObjective',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Objective deleted');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Delete failed');
        throw e;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  return { items, total, loading, create, update, remove, reload: load };
}
