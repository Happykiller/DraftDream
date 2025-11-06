//  src/hooks/useUsers.ts
import * as React from 'react';

import type { UserType } from '@src/commons/enums';
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
  type: UserType;
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

export interface UseUsersParams {
  page: number; // 1-based
  limit: number;
  q: string;
  type?: UserType;
}

export function useUsers({ page, limit, q, type }: UseUsersParams) {
  const [items, setItems] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(
    async (vars: { page: number; limit: number; q?: string; type?: UserType }) => {
      setLoading(true);
      try {
        const trimmedQ = vars.q?.trim();
        const trimmedType = vars.type?.trim();

        const { data, errors } = await execute(() =>
          gql.send<UsersListPayload>({
            query: LIST_Q,
            variables: {
              input: {
                page: vars.page,
                limit: vars.limit,
                q: trimmedQ || undefined,
                type: trimmedType || undefined,
              },
            },
            operationName: 'ListUsers',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        setItems(data?.user_list.items ?? []);
        setTotal(data?.user_list.total ?? 0);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load users';
        flashError(message);
      } finally {
        setLoading(false);
      }
    },
    [execute, gql, flashError]
  );

  const lastSigRef = React.useRef<string | null>(null);
  const sig = `${page}|${limit}|${q || ''}|${type || ''}`;

  // Comment in English: Avoid duplicate fetches in StrictMode while still reloading on new mounts.
  React.useEffect(() => {
    if (lastSigRef.current === sig) return;
    lastSigRef.current = sig;
    void load({ page, limit, q, type });
  }, [sig, load]);

  return {
    items,
    total,
    loading,
    reload: () => load({ page, limit, q, type }),
  };
}
