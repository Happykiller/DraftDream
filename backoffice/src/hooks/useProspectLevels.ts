// src/hooks/useProspectLevels.ts
// Comment in English: CRUD GraphQL hook for prospect levels.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ProspectLevelVisibility = 'PRIVATE' | 'PUBLIC';

export interface ProspectLevel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: ProspectLevelVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type ProspectLevelListPayload = {
  prospectLevel_list: {
    items: ProspectLevel[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateProspectLevelPayload = { prospectLevel_create: ProspectLevel };
type UpdateProspectLevelPayload = { prospectLevel_update: ProspectLevel };
type DeleteProspectLevelPayload = { prospectLevel_delete: boolean };

const LIST_Q = `
  query ListProspectLevels($input: ListProspectLevelsInput) {
    prospectLevel_list(input: $input) {
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
  mutation CreateProspectLevel($input: CreateProspectLevelInput!) {
    prospectLevel_create(input: $input) {
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
  mutation UpdateProspectLevel($input: UpdateProspectLevelInput!) {
    prospectLevel_update(input: $input) {
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
  mutation DeleteProspectLevel($id: ID!) {
    prospectLevel_delete(id: $id)
  }
`;

export interface UseProspectLevelsParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useProspectLevels({ page, limit, q }: UseProspectLevelsParams) {
  const [items, setItems] = React.useState<ProspectLevel[]>([]);
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
        gql.send<ProspectLevelListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListProspectLevels',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.prospectLevel_list.items ?? []);
      setTotal(data?.prospectLevel_list.total ?? 0);
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
    async (input: { label: string; locale: string; visibility: ProspectLevelVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateProspectLevelPayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateProspectLevel',
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
      visibility?: ProspectLevelVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateProspectLevelPayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateProspectLevel',
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
          gql.send<DeleteProspectLevelPayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteProspectLevel',
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
