// src/hooks/useClientLevels.ts
// Comment in English: CRUD GraphQL hook for client levels.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ClientLevelVisibility = 'PRIVATE' | 'PUBLIC';

export interface ClientLevel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: ClientLevelVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type ClientLevelListPayload = {
  clientLevel_list: {
    items: ClientLevel[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateClientLevelPayload = { clientLevel_create: ClientLevel };
type UpdateClientLevelPayload = { clientLevel_update: ClientLevel };
type DeleteClientLevelPayload = { clientLevel_delete: boolean };

const LIST_Q = `
  query ListClientLevels($input: ListClientLevelsInput) {
    clientLevel_list(input: $input) {
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
  mutation CreateClientLevel($input: CreateClientLevelInput!) {
    clientLevel_create(input: $input) {
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
  mutation UpdateClientLevel($input: UpdateClientLevelInput!) {
    clientLevel_update(input: $input) {
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
  mutation DeleteClientLevel($id: ID!) {
    clientLevel_delete(id: $id)
  }
`;

export interface UseClientLevelsParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useClientLevels({ page, limit, q }: UseClientLevelsParams) {
  const [items, setItems] = React.useState<ClientLevel[]>([]);
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
        gql.send<ClientLevelListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListClientLevels',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.clientLevel_list.items ?? []);
      setTotal(data?.clientLevel_list.total ?? 0);
    } catch (e: any) {
      flashError(e?.message ?? 'Failed to load levels');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: { label: string; locale: string; visibility: ClientLevelVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateClientLevelPayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateClientLevel',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Level created');
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
      visibility?: ClientLevelVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateClientLevelPayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateClientLevel',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Level updated');
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
          gql.send<DeleteClientLevelPayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteClientLevel',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Level deleted');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Delete failed');
        throw e;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  return { items, total, loading, create, update, remove };
}
