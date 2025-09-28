//  src/hooks/useUsers.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
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

// --- StrictMode dedupe cache ---
const LAST_SIG = new Map<string, string>();
const KEY = 'users';

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

export interface UseUsersParams {
  page: number; // 1-based
  limit: number;
  q: string;
}

export function useUsers({ page, limit, q }: UseUsersParams) {
  const [items, setItems] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const flash = useFlashStore();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(
    async (vars: { page: number; limit: number; q?: string }) => {
      setLoading(true);
      try {
        const { data, errors } = await gql.send<UsersListPayload>({
          query: LIST_Q,
          variables: { input: { page: vars.page, limit: vars.limit, q: vars.q || undefined } },
          operationName: 'ListUsers',
        });
        if (errors?.length) throw new Error(errors[0].message);
        setItems(data?.user_list.items ?? []);
        setTotal(data?.user_list.total ?? 0);
      } catch (e: any) {
        flash.error(e?.message ?? 'Failed to load users');
      } finally {
        setLoading(false);
      }
    },
    [gql, flash]
  );

  const sig = `${page}|${limit}|${q || ''}`;
  React.useEffect(() => {
    if (LAST_SIG.get(KEY) === sig) return;
    LAST_SIG.set(KEY, sig);
    void load({ page, limit, q });
  }, [sig, load]);

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
      const { errors } = await gql.send<CreateUserPayload>({
        query: CREATE_M,
        variables: { input },
        operationName: 'CreateUser',
      });
      if (errors?.length) {
        const msg = errors[0].message;
        flash.error(msg || 'Create failed');
        throw new Error(msg);
      }
      flash.success('User created');
      await load({ page, limit, q });
    },
    [gql, flash, load, page, limit, q]
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
      const { errors } = await gql.send<UpdateUserPayload>({
        query: UPDATE_M,
        variables: { input },
        operationName: 'UpdateUser',
      });
      if (errors?.length) {
        const msg = errors[0].message;
        flash.error(msg || 'Update failed');
        throw new Error(msg);
      }
      flash.success('User updated');
      await load({ page, limit, q });
    },
    [gql, flash, load, page, limit, q]
  );

  return { items, total, loading, create, update, reload: () => load({ page, limit, q }) };
}
