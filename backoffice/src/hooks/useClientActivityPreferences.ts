// src/hooks/useClientActivityPreferences.ts
// Comment in English: CRUD GraphQL hook for client activity preferences (prospects panel).
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ClientActivityPreferenceVisibility = 'PRIVATE' | 'PUBLIC';

export interface ClientActivityPreference {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: ClientActivityPreferenceVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type ClientActivityPreferenceListPayload = {
  clientActivityPreference_list: {
    items: ClientActivityPreference[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateClientActivityPreferencePayload = { clientActivityPreference_create: ClientActivityPreference };
type UpdateClientActivityPreferencePayload = { clientActivityPreference_update: ClientActivityPreference };
type DeleteClientActivityPreferencePayload = { clientActivityPreference_delete: boolean };

const LIST_Q = `
  query ListClientActivityPreferences($input: ListClientActivityPreferencesInput) {
    clientActivityPreference_list(input: $input) {
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
  mutation CreateClientActivityPreference($input: CreateClientActivityPreferenceInput!) {
    clientActivityPreference_create(input: $input) {
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
  mutation UpdateClientActivityPreference($input: UpdateClientActivityPreferenceInput!) {
    clientActivityPreference_update(input: $input) {
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
  mutation DeleteClientActivityPreference($id: ID!) {
    clientActivityPreference_delete(id: $id)
  }
`;

export interface UseClientActivityPreferencesParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useClientActivityPreferences({ page, limit, q }: UseClientActivityPreferencesParams) {
  const [items, setItems] = React.useState<ClientActivityPreference[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore(state => state.error);
  const flashSuccess = useFlashStore(state => state.success);

  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<ClientActivityPreferenceListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListClientActivityPreferences',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.clientActivityPreference_list.items ?? []);
      setTotal(data?.clientActivityPreference_list.total ?? 0);
    } catch (e: any) {
      flashError(e?.message ?? 'Failed to load activity preferences');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: { slug: string; label: string; locale: string; visibility: ClientActivityPreferenceVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateClientActivityPreferencePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateClientActivityPreference',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Activity preference created');
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
      slug?: string;
      label?: string;
      locale?: string;
      visibility?: ClientActivityPreferenceVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateClientActivityPreferencePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateClientActivityPreference',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Activity preference updated');
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
          gql.send<DeleteClientActivityPreferencePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteClientActivityPreference',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Activity preference deleted');
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

