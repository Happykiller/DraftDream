// src/hooks/useCategories.ts
import * as React from 'react';

import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type Visibility = 'PRIVATE' | 'PUBLIC';

export interface Category {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: Visibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

type CategoryListPayload = {
  category_list: {
    items: Category[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateCategoryPayload = { category_create: Category };
type UpdateCategoryPayload = { category_update: Category };
type DeleteCategoryPayload = { category_delete: boolean };

const LIST_Q = `
  query ListCategories($input: ListCategoriesInput) {
    category_list(input: $input) {
      items { id slug locale label visibility creator { id email } createdAt updatedAt }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    category_create(input: $input) {
      id slug locale label visibility creator { id email } createdAt updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    category_update(input: $input) {
      id slug locale label visibility creator { id email } createdAt updatedAt
    }
  }
`;

const DELETE_M = `
  mutation DeleteCategory($id: ID!) {
    category_delete(id: $id)
  }
`;

export interface UseCategoriesParams {
  page: number;  // 1-based
  limit: number;
  q: string;
}

export function useCategories({ page, limit, q }: UseCategoriesParams) {
  const [items, setItems] = React.useState<Category[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);

  // Create one fetch service instance (it handles 401, redirects, etc.)
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<CategoryListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListCategories',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.category_list.items ?? []);
      setTotal(data?.category_list.total ?? 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load categories';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: {
      slug: string;
      locale: string;
      label: string;
      visibility: Visibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateCategoryPayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateCategory',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Category created');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Create failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load]
  );

  const update = React.useCallback(
    async (input: { id: string; slug?: string; locale?: string; label?: string }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateCategoryPayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateCategory',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Category updated');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Update failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load]
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeleteCategoryPayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteCategory',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Category deleted');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Delete failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load]
  );

  return { items, total, loading, create, update, remove, reload: load };
}
