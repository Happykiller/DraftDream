// src/hooks/useSessions.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface Session {
  id: string;

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
  visibility: 'PUBLIC' | 'PRIVATE';
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
        id locale label durationMin description exerciseIds visibility
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
      id locale label durationMin description exerciseIds visibility
      exercises { id label }
      createdBy createdAt updatedAt
      creator { id email }
    }
  }
`;

const UPDATE_M = `
  mutation UpdateSession($input: UpdateSessionInput!) {
    session_update(input: $input) {
      id locale label durationMin description exerciseIds visibility
      exercises { id label }
      createdBy createdAt updatedAt
      creator { id email }
    }
  }
`;

const DELETE_M = `
  mutation DeleteSession($id: ID!) {
    session_softDelete(id: $id)
  }
`;

export interface UseSessionsParams {
  page: number; // 1-based
  limit: number;
  q: string;
  locale?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export function useSessions(props: UseSessionsParams) {
  const { page, limit, q, locale, visibility } = props;
  const [items, setItems] = React.useState<Session[]>([]);
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
        gql.send<SessionListPayload>({
          query: LIST_Q,
          operationName: 'ListSessions',
          variables: {
            input: {
              page,
              limit,
              q: q || undefined,
              locale: locale || undefined,
              visibility: props.visibility,
            },
          },
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.session_list.items ?? []);
      setTotal(data?.session_list.total ?? 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load sessions';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, locale, page, q, visibility]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: {

      locale: string;
      label: string;
      durationMin: number;
      description?: string;
      exerciseIds: string[];
      visibility?: 'PUBLIC' | 'PRIVATE';
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateSessionPayload>({
            query: CREATE_M,
            operationName: 'CreateSession',
            variables: { input },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Session created');
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
    async (input: {
      id: string;

      locale?: string;
      label?: string;
      durationMin?: number;
      description?: string | null;
      exerciseIds?: string[];
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateSessionPayload>({
            query: UPDATE_M,
            operationName: 'UpdateSession',
            variables: { input },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Session updated');
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
          gql.send<DeleteSessionPayload>({
            query: DELETE_M,
            operationName: 'DeleteSession',
            variables: { id },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Session deleted');
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
