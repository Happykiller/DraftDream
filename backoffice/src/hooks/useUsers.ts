//  src/hooks/useUsers.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface Address {
  name: string;
  city: string;
  code: string;
  country: string;
}
export interface Company {
  name: string;
  address?: Address | null;
}
export interface User {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: Address | null;
  company?: Company | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  is_active: boolean;
  createdBy: string;
}

type UsersListPayload = {
  user_list: {
    items: User[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateUserPayload = { user_create: User };
type UpdateUserPayload = { user_update: User };

const LIST_Q = `
  query ListUsers($input: ListUsersInput) {
    user_list(input: $input) {
      items {
        id type first_name last_name email phone
        is_active createdBy
        company { name }
        address { name city code country }
        createdAt updatedAt
      }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateUser($input: CreateUserInput!) {
    user_create(input: $input) {
      id type first_name last_name email phone
      is_active createdBy
      company { name }
      address { name city code country }
      createdAt updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateUser($input: UpdateUserInput!) {
    user_update(input: $input) {
      id type first_name last_name email phone
      is_active createdBy
      company { name }
      address { name city code country }
      createdAt updatedAt
    }
  }
`;

const DELETE_M = `
  mutation DeleteUser($id: ID!) {
    user_delete(id: $id)
  }
`;

export interface UseUsersParams {
  page: number; // 1-based
  limit: number;
  q: string;
  type?: 'athlete' | 'coach' | 'admin';
}

export function useUsers({ page, limit, q, type }: UseUsersParams) {
  const [items, setItems] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(
    async (vars: { page: number; limit: number; q?: string; type?: 'athlete' | 'coach' | 'admin' }) => {
      setLoading(true);
      try {
        const { data, errors } = await execute(() =>
          gql.send<UsersListPayload>({
            query: LIST_Q,
            variables: {
              input: {
                page: vars.page,
                limit: vars.limit,
                q: vars.q || undefined,
                type: vars.type,
              },
            },
            operationName: 'ListUsers',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        setItems(data?.user_list.items ?? []);
        setTotal(data?.user_list.total ?? 0);
      } catch (e: any) {
        flashError(e?.message ?? 'Failed to load users');
      } finally {
        setLoading(false);
      }
    },
    [execute, gql, flashError]
  );

  const lastSigRef = React.useRef<string | null>(null);
  const sig = `${page}|${limit}|${q || ''}|${type || '-'}`;

  // Comment in English: Avoid duplicate fetches in StrictMode without blocking new mounts.
  React.useEffect(() => {
    if (lastSigRef.current === sig) return;
    lastSigRef.current = sig;
    void load({ page, limit, q, type });
  }, [sig, load, page, limit, q, type]);

  const create = React.useCallback(
    async (input: {
      type: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string | null;
      password: string;
      confirm_password?: string | null;
      is_active?: boolean;
      address?: Address | null;
      company?: Company | null;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateUserPayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateUser',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('User created');
        await load({ page, limit, q, type });
      } catch (e: any) {
        flashError(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load, page, limit, q, type]
  );

  const update = React.useCallback(
    async (input: {
      id: string;
      type?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string | null;
      is_active?: boolean;
      address?: Address | null;
      company?: Company | null;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateUserPayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateUser',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('User updated');
        await load({ page, limit, q, type });
      } catch (e: any) {
        flashError(e?.message ?? 'Update failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load, page, limit, q, type]
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<{ user_delete: boolean }>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteUser',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('User deleted');
        await load({ page, limit, q, type });
      } catch (e: any) {
        flashError(e?.message ?? 'Delete failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load, page, limit, q, type]
  );

  return { items, total, loading, create, update, remove, reload: () => load({ page, limit, q, type }) };
}
