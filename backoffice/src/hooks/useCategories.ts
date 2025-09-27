// src/hooks/useCategories.ts
// ⚠️ Comment in English: Categories data hook using the existing GraphqlServiceFetch.
// It supports server-side pagination & search, and exposes CRUD helpers.

import * as React from 'react';
import { GraphqlServiceFetch } from '@src/services/graphql/graphql.service.fetch';
import { useFlashStore } from '@hooks/useFlashStore'; // Si votre chemin diffère: ajustez l'import

export type Visibility = 'PRIVATE' | 'PUBLIC';

export interface Category {
  id: string;
  slug: string;
  locale: string;
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
      items { id slug locale visibility createdBy createdAt updatedAt }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    category_create(input: $input) {
      id slug locale visibility createdBy createdAt updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    category_update(input: $input) {
      id slug locale visibility createdBy createdAt updatedAt
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
  const flash = useFlashStore();

  // Create one fetch service instance (it handles 401, redirects, etc.)
  const gql = React.useMemo(() => new GraphqlServiceFetch(undefined), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await gql.send<CategoryListPayload>({
        query: LIST_Q,
        variables: { input: { page, limit, q: q || undefined } },
        operationName: 'ListCategories',
      });
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.category_list.items ?? []);
      setTotal(data?.category_list.total ?? 0);
    } catch (e: any) {
      flash.error(e?.message ?? 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, gql, flash]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: { slug: string; locale: string; visibility: Visibility }) => {
      try {
        const { errors } = await gql.send<CreateCategoryPayload>({
          query: CREATE_M,
          variables: { input },
          operationName: 'CreateCategory',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Category created');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  const update = React.useCallback(
    async (input: { id: string; slug?: string; locale?: string }) => {
      try {
        const { errors } = await gql.send<UpdateCategoryPayload>({
          query: UPDATE_M,
          variables: { input },
          operationName: 'UpdateCategory',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Category updated');
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
        const { errors } = await gql.send<DeleteCategoryPayload>({
          query: DELETE_M,
          variables: { id },
          operationName: 'DeleteCategory',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Category deleted');
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
