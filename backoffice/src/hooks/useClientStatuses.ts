// src/hooks/useClientStatuses.ts
// Comment in English: CRUD GraphQL hook for client statuses.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ClientStatusVisibility = 'PRIVATE' | 'PUBLIC';

export interface ClientStatus {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: ClientStatusVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type ClientStatusListPayload = {
  clientStatus_list: {
    items: ClientStatus[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateClientStatusPayload = { clientStatus_create: ClientStatus };
type UpdateClientStatusPayload = { clientStatus_update: ClientStatus };
type DeleteClientStatusPayload = { clientStatus_delete: boolean };

const LIST_Q = `
  query ListClientStatuses($input: ListClientStatusesInput) {
    clientStatus_list(input: $input) {
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
  mutation CreateClientStatus($input: CreateClientStatusInput!) {
    clientStatus_create(input: $input) {
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
  mutation UpdateClientStatus($input: UpdateClientStatusInput!) {
    clientStatus_update(input: $input) {
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
  mutation DeleteClientStatus($id: ID!) {
    clientStatus_delete(id: $id)
  }
`;

export interface UseClientStatusesParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useClientStatuses({ page, limit, q }: UseClientStatusesParams) {
  const [items, setItems] = React.useState<ClientStatus[]>([]);
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
        gql.send<ClientStatusListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListClientStatuses',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.clientStatus_list.items ?? []);
      setTotal(data?.clientStatus_list.total ?? 0);
    } catch (e: any) {
      flashError(e?.message ?? 'Failed to load statuses');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: { label: string; locale: string; visibility: ClientStatusVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateClientStatusPayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateClientStatus',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Status created');
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
      visibility?: ClientStatusVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateClientStatusPayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateClientStatus',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Status updated');
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
          gql.send<DeleteClientStatusPayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteClientStatus',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Status deleted');
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
