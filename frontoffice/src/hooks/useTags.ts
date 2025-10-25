// src/hooks/useTags.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type TagVisibility = 'PRIVATE' | 'PUBLIC';

export interface Tag {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: TagVisibility;
  createdBy: string;     // per schema (string)
  createdAt: string;
  updatedAt: string;
}

type TagListPayload = {
  tag_list: {
    items: Tag[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreatePayload = { tag_create: Tag };
type UpdatePayload = { tag_update: Tag };
type DeletePayload = { tag_delete: boolean };

const LIST_Q = `
  query ListTags($input: ListTagsInput) {
    tag_list(input: $input) {
      items { id slug locale label visibility createdBy createdAt updatedAt }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateTag($input: CreateTagInput!) {
    tag_create(input: $input) {
      id slug locale label visibility createdBy createdAt updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateTag($input: UpdateTagInput!) {
    tag_update(input: $input) {
      id slug locale label visibility createdBy createdAt updatedAt
    }
  }
`;

const DELETE_M = `
  mutation DeleteTag($id: ID!) {
    tag_delete(id: $id)
  }
`;

export interface UseTagsParams {
  page: number;  // 1-based
  limit: number;
  q: string;
}

export function useTags({ page, limit, q }: UseTagsParams) {
  const [items, setItems] = React.useState<Tag[]>([]);
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
        gql.send<TagListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListTags',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.tag_list.items ?? []);
      setTotal(data?.tag_list.total ?? 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load tags';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: {
      slug: string;
      locale: string;
      label: string;
      visibility: TagVisibility;
    }) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<CreatePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateTag',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        const created = data?.tag_create;
        if (!created) throw new Error('CreateTag returned no data');
        flashSuccess('Tag created');
        await load();
        return created;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Create failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load]
  );

  const update = React.useCallback(
    async (input: {
      id: string;
      slug?: string;
      locale?: string;
      label?: string;
      visibility?: TagVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdatePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateTag',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Tag updated');
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
          gql.send<DeletePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteTag',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Tag deleted');
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
