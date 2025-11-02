// src/hooks/useMealTypes.ts
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type MealTypeVisibility = 'PRIVATE' | 'PUBLIC';

export interface MealType {
  id: string;
  slug: string;
  label: string;
  locale: string;
  visibility: MealTypeVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

interface MealTypeListPayload {
  mealType_list: {
    items: MealType[];
    total: number;
    page: number;
    limit: number;
  };
}

interface CreateMealTypePayload {
  mealType_create: MealType;
}

interface UpdateMealTypePayload {
  mealType_update: MealType;
}

interface DeleteMealTypePayload {
  mealType_delete: boolean;
}

const LIST_QUERY = `
  query ListMealTypes($input: ListMealTypesInput) {
    mealType_list(input: $input) {
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

const CREATE_MUTATION = `
  mutation CreateMealType($input: CreateMealTypeInput!) {
    mealType_create(input: $input) {
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

const UPDATE_MUTATION = `
  mutation UpdateMealType($input: UpdateMealTypeInput!) {
    mealType_update(input: $input) {
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

const DELETE_MUTATION = `
  mutation DeleteMealType($id: ID!) {
    mealType_delete(id: $id)
  }
`;

export interface UseMealTypesParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useMealTypes({ page, limit, q }: UseMealTypesParams) {
  const [items, setItems] = React.useState<MealType[]>([]);
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
        gql.send<MealTypeListPayload>({
          query: LIST_QUERY,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListMealTypes',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.mealType_list.items ?? []);
      setTotal(data?.mealType_list.total ?? 0);
    } catch (error: any) {
      flashError(error?.message ?? 'Failed to load meal types');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: { slug: string; label: string; locale: string; visibility: MealTypeVisibility }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateMealTypePayload>({
            query: CREATE_MUTATION,
            variables: { input },
            operationName: 'CreateMealType',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal type created');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Create failed');
        throw error;
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
      visibility?: MealTypeVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateMealTypePayload>({
            query: UPDATE_MUTATION,
            variables: { input },
            operationName: 'UpdateMealType',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal type updated');
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
          gql.send<DeleteMealTypePayload>({
            query: DELETE_MUTATION,
            variables: { id },
            operationName: 'DeleteMealType',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal type deleted');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Delete failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  return { items, total, loading, create, update, remove, reload: load };
}
