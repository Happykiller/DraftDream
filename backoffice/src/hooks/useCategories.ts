// src/hooks/useCategories.ts
import * as React from 'react';

import inversify from '@src/commons/inversify';
import { useFlashStore } from '@hooks/useFlashStore'; 
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type Visibility = 'PRIVATE' | 'PUBLIC';

export interface Category {
  id: string;
  slug: string;
  label: string;
  locale: string;
  visibility: Visibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
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
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    category_create(input: $input) {
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
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    category_update(input: $input) {
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
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);

  // Create one fetch service instance (it handles 401, redirects, etc.)
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

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
      flashError(e?.message ?? 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, gql, flashError]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: { slug: string; label: string; locale: string; visibility: Visibility }) => {
      try {
        const { errors } = await gql.send<CreateCategoryPayload>({
          query: CREATE_M,
          variables: { input },
          operationName: 'CreateCategory',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Category created');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [gql, flashError, flashSuccess, load]
  );

  const update = React.useCallback(
    async (input: { id: string; slug?: string; label?: string; locale?: string }) => {
      try {
        const { errors } = await gql.send<UpdateCategoryPayload>({
          query: UPDATE_M,
          variables: { input },
          operationName: 'UpdateCategory',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Category updated');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Update failed');
        throw e;
      }
    },
    [gql, flashError, flashSuccess, load]
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
        flashSuccess('Category deleted');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Delete failed');
        throw e;
      }
    },
    [gql, flashError, flashSuccess, load]
  );

  return { items, total, loading, create, update, remove, reload: load };
}
