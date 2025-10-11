// src/hooks/useTags.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type TagVisibility = 'PRIVATE' | 'PUBLIC';

export interface Tag {
  id: string;
  slug: string;
  name: string;
  locale: string;
  visibility: TagVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
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
      items {
        id
        slug
        name
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
  mutation CreateTag($input: CreateTagInput!) {
    tag_create(input: $input) {
      id
      slug
      name
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
  mutation UpdateTag($input: UpdateTagInput!) {
    tag_update(input: $input) {
      id
      slug
      name
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
  const flash = useFlashStore();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await gql.send<TagListPayload>({
        query: LIST_Q,
        variables: { input: { page, limit, q: q || undefined } },
        operationName: 'ListTags',
      });
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.tag_list.items ?? []);
      setTotal(data?.tag_list.total ?? 0);
    } catch (e: any) {
      flash.error(e?.message ?? 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, gql, flash]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: { slug: string; name: string; locale: string; visibility: TagVisibility }) => {
      try {
        const { errors } = await gql.send<CreatePayload>({
          query: CREATE_M,
          variables: { input },
          operationName: 'CreateTag',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Tag created');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  const update = React.useCallback(
    async (input: { id: string; slug?: string; name?: string; locale?: string }) => {
      try {
        const { errors } = await gql.send<UpdatePayload>({
          query: UPDATE_M,
          variables: { input },
          operationName: 'UpdateTag',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Tag updated');
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
          operationName: 'DeleteTag',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Tag deleted');
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
