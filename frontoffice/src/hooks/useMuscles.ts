// src/hooks/useMuscles.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type MuscleVisibility = 'PRIVATE' | 'PUBLIC';

export interface Muscle {
  id: string;
  slug: string;
  locale: string;
  name: string;
  visibility: MuscleVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

type MuscleListPayload = {
  muscle_list: {
    items: Muscle[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreatePayload = { muscle_create: Muscle };
type UpdatePayload = { muscle_update: Muscle };
type DeletePayload = { muscle_delete: boolean };

const LIST_Q = `
  query ListMuscles($input: ListMusclesInput) {
    muscle_list(input: $input) {
      items { id slug locale name visibility creator { id email } createdAt updatedAt }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateMuscle($input: CreateMuscleInput!) {
    muscle_create(input: $input) {
      id slug locale name visibility creator { id email } createdAt updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateMuscle($input: UpdateMuscleInput!) {
    muscle_update(input: $input) {
      id slug locale name visibility creator { id email } createdAt updatedAt
    }
  }
`;

const DELETE_M = `
  mutation DeleteMuscle($id: ID!) {
    muscle_delete(id: $id)
  }
`;

export interface UseMusclesParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useMuscles({ page, limit, q }: UseMusclesParams) {
  const [items, setItems] = React.useState<Muscle[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const flash = useFlashStore();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await gql.send<MuscleListPayload>({
        query: LIST_Q,
        variables: { input: { page, limit, q: q || undefined } },
        operationName: 'ListMuscles',
      });
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.muscle_list.items ?? []);
      setTotal(data?.muscle_list.total ?? 0);
    } catch (e: any) {
      flash.error(e?.message ?? 'Failed to load muscles');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, gql, flash]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: {
      slug: string;
      locale: string;
      name: string;
      visibility: MuscleVisibility;
    }) => {
      try {
        const { errors } = await gql.send<CreatePayload>({
          query: CREATE_M,
          variables: { input },
          operationName: 'CreateMuscle',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Muscle created');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  const update = React.useCallback(
    async (input: {
      id: string;
      slug?: string;
      locale?: string;
      name?: string;
      visibility?: MuscleVisibility;
    }) => {
      try {
        const { errors } = await gql.send<UpdatePayload>({
          query: UPDATE_M,
          variables: { input },
          operationName: 'UpdateMuscle',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Muscle updated');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Update failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await gql.send<DeletePayload>({
          query: DELETE_M,
          variables: { id },
          operationName: 'DeleteMuscle',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Muscle deleted');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Delete failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  return { items, total, loading, create, update, remove, reload: load };
}
