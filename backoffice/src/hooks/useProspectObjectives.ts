// src/hooks/useProspectObjectives.ts
// Comment in English: Full CRUD hook for prospect objectives.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

import type { Visibility } from '@src/commons/visibility';

export type ProspectObjectiveVisibility = Visibility;

export interface ProspectObjective {
  id: string;
  slug: string;
  label: string;
  locale: string;
  visibility: ProspectObjectiveVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type ProspectObjectiveListPayload = {
  prospectObjective_list: {
    items: ProspectObjective[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateProspectObjectivePayload = { prospectObjective_create: ProspectObjective };
type UpdateProspectObjectivePayload = { prospectObjective_update: ProspectObjective };
type DeleteProspectObjectivePayload = { prospectObjective_delete: boolean };

const LIST_Q = `
  query ListProspectObjectives($input: ListProspectObjectivesInput) {
    prospectObjective_list(input: $input) {
      items {
        id
        slug
        label
        locale
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
  mutation CreateProspectObjective($input: CreateProspectObjectiveInput!) {
    prospectObjective_create(input: $input) {
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
  mutation UpdateProspectObjective($input: UpdateProspectObjectiveInput!) {
    prospectObjective_update(input: $input) {
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
  mutation DeleteProspectObjective($id: ID!) {
    prospectObjective_delete(id: $id)
  }
`;

export interface UseProspectObjectivesParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useProspectObjectives({ page, limit, q }: UseProspectObjectivesParams) {
  const [items, setItems] = React.useState<ProspectObjective[]>([]);
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
        gql.send<ProspectObjectiveListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListProspectObjectives',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.prospectObjective_list.items ?? []);
      setTotal(data?.prospectObjective_list.total ?? 0);
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
    async (input: { label: string; locale: string; visibility: ProspectObjectiveVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateProspectObjectivePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateProspectObjective',
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
      visibility?: ProspectObjectiveVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateProspectObjectivePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateProspectObjective',
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
          gql.send<DeleteProspectObjectivePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteProspectObjective',
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
