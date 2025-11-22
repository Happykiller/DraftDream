// src/hooks/useProspectActivityPreferences.ts
// Comment in English: CRUD GraphQL hook for prospect activity preferences.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ProspectActivityPreferenceVisibility = 'PRIVATE' | 'PUBLIC';

export interface ProspectActivityPreference {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: ProspectActivityPreferenceVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type ProspectActivityPreferenceListPayload = {
  prospectActivityPreference_list: {
    items: ProspectActivityPreference[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateProspectActivityPreferencePayload = { prospectActivityPreference_create: ProspectActivityPreference };
type UpdateProspectActivityPreferencePayload = { prospectActivityPreference_update: ProspectActivityPreference };
type DeleteProspectActivityPreferencePayload = { prospectActivityPreference_delete: boolean };

const LIST_Q = `
  query ListProspectActivityPreferences($input: ListProspectActivityPreferencesInput) {
    prospectActivityPreference_list(input: $input) {
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
  mutation CreateProspectActivityPreference($input: CreateProspectActivityPreferenceInput!) {
    prospectActivityPreference_create(input: $input) {
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
  mutation UpdateProspectActivityPreference($input: UpdateProspectActivityPreferenceInput!) {
    prospectActivityPreference_update(input: $input) {
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
  mutation DeleteProspectActivityPreference($id: ID!) {
    prospectActivityPreference_delete(id: $id)
  }
`;

export interface UseProspectActivityPreferencesParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useProspectActivityPreferences({ page, limit, q }: UseProspectActivityPreferencesParams) {
  const [items, setItems] = React.useState<ProspectActivityPreference[]>([]);
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
        gql.send<ProspectActivityPreferenceListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListProspectActivityPreferences',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.prospectActivityPreference_list.items ?? []);
      setTotal(data?.prospectActivityPreference_list.total ?? 0);
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
    async (input: { label: string; locale: string; visibility: ProspectActivityPreferenceVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateProspectActivityPreferencePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateProspectActivityPreference',
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
      label?: string;
      locale?: string;
      visibility?: ProspectActivityPreferenceVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateProspectActivityPreferencePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateProspectActivityPreference',
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
          gql.send<DeleteProspectActivityPreferencePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteProspectActivityPreference',
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

