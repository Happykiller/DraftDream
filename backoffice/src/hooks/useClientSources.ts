// src/hooks/useClientSources.ts
// Comment in English: CRUD GraphQL hook for client sources.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ClientSourceVisibility = 'PRIVATE' | 'PUBLIC';

export interface ClientSource {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: ClientSourceVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type ClientSourceListPayload = {
  clientSource_list: {
    items: ClientSource[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateClientSourcePayload = { clientSource_create: ClientSource };
type UpdateClientSourcePayload = { clientSource_update: ClientSource };
type DeleteClientSourcePayload = { clientSource_delete: boolean };

const LIST_Q = `
  query ListClientSources($input: ListClientSourcesInput) {
    clientSource_list(input: $input) {
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
  mutation CreateClientSource($input: CreateClientSourceInput!) {
    clientSource_create(input: $input) {
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
  mutation UpdateClientSource($input: UpdateClientSourceInput!) {
    clientSource_update(input: $input) {
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
  mutation DeleteClientSource($id: ID!) {
    clientSource_delete(id: $id)
  }
`;

export interface UseClientSourcesParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useClientSources({ page, limit, q }: UseClientSourcesParams) {
  const [items, setItems] = React.useState<ClientSource[]>([]);
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
        gql.send<ClientSourceListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListClientSources',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.clientSource_list.items ?? []);
      setTotal(data?.clientSource_list.total ?? 0);
    } catch (e: any) {
      flashError(e?.message ?? 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: { label: string; locale: string; visibility: ClientSourceVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateClientSourcePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateClientSource',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Source created');
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
      visibility?: ClientSourceVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateClientSourcePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateClientSource',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Source updated');
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
          gql.send<DeleteClientSourcePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteClientSource',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Source deleted');
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
