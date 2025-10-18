// src/hooks/useSessions.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface Session {
  id: string;
  slug: string;
  locale: string;
  label: string;
  durationMin: number;
  description?: string | null;
  exerciseIds: string[];
  exercises: { id: string; label: string }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; email: string } | null;
}

type SessionListPayload = {
  session_list: {
    items: Session[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateSessionPayload = { session_create: Session };
type UpdateSessionPayload = { session_update: Session };
type DeleteSessionPayload = { session_delete: boolean };

const LIST_Q = `
  query ListSessions($input: ListSessionsInput) {
    session_list(input: $input) {
      items {
        id slug locale label durationMin description exerciseIds
        exercises { id label }
        createdBy createdAt updatedAt
        creator { id email }
      }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateSession($input: CreateSessionInput!) {
    session_create(input: $input) {
      id slug locale label durationMin description exerciseIds
      exercises { id label }
      createdBy createdAt updatedAt
      creator { id email }
    }
  }
`;

const UPDATE_M = `
  mutation UpdateSession($input: UpdateSessionInput!) {
    session_update(input: $input) {
      id slug locale label durationMin description exerciseIds
      exercises { id label }
      createdBy createdAt updatedAt
      creator { id email }
    }
  }
`;

const DELETE_M = `
  mutation DeleteSession($id: ID!) {
    session_delete(id: $id)
  }
`;

export interface UseSessionsParams {
  page: number; // 1-based
  limit: number;
  q: string;
  locale?: string;
}

export function useSessions({ page, limit, q, locale }: UseSessionsParams) {
  const [items, setItems] = React.useState<Session[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const flash = useFlashStore();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await gql.send<SessionListPayload>({
        query: LIST_Q,
        operationName: 'ListSessions',
        variables: {
          input: {
            page,
            limit,
            q: q || undefined,
            locale: locale || undefined,
          },
        },
      });
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.session_list.items ?? []);
      setTotal(data?.session_list.total ?? 0);
    } catch (e: any) {
      flash.error(e?.message ?? 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, locale, gql, flash]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: {
      slug: string;
      locale: string;
      label: string;
      durationMin: number;
      description?: string;
      exerciseIds: string[];
    }) => {
      try {
        const { errors } = await gql.send<CreateSessionPayload>({
          query: CREATE_M,
          operationName: 'CreateSession',
          variables: { input },
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Session created');
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
      label?: string;
      durationMin?: number;
      description?: string | null;
      exerciseIds?: string[];
    }) => {
      try {
        const { errors } = await gql.send<UpdateSessionPayload>({
          query: UPDATE_M,
          operationName: 'UpdateSession',
          variables: { input },
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Session updated');
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
        const { errors } = await gql.send<DeleteSessionPayload>({
          query: DELETE_M,
          operationName: 'DeleteSession',
          variables: { id },
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Session deleted');
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
