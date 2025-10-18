// src/hooks/useUser.ts
import * as React from 'react';

import inversify from '@src/commons/inversify';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';
import { session } from '@stores/session';

export type UserProfile = {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type MePayload = {
  me: UserProfile | null;
};

const ME_QUERY = `
  query Me {
    me {
      id
      type
      first_name
      last_name
      email
      phone
      createdAt
      updatedAt
    }
  }
`;

export type UseUserResult = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

/**
 * Fetches the authenticated user profile and keeps the session store in sync.
 * The GraphQL service automatically handles token expiration.
 */
export function useUser(options?: { skip?: boolean }): UseUserResult {
  const skip = options?.skip ?? false;
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
  const mountedRef = React.useRef(true);
  const initRef = React.useRef(false);

  const runIfMounted = React.useCallback(
    (callback: () => void) => {
      if (mountedRef.current) callback();
    },
    [],
  );

  const load = React.useCallback(async () => {
    runIfMounted(() => {
      setLoading(true);
      setError(null);
    });
    try {
      const { data, errors } = await gql.send<MePayload>({
        query: ME_QUERY,
        operationName: 'Me',
      });
      if (errors?.length) throw new Error(errors[0].message);

      const profile = data?.me ?? null;
      if (profile) {
        session.setState({
          id: profile.id,
          name_first: profile.first_name,
          name_last: profile.last_name,
          role: profile.type,
        });
      }

      runIfMounted(() => {
        setUser(profile);
        setError(null);
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load user profile';
      runIfMounted(() => {
        setUser(null);
        setError(message);
      });
    } finally {
      runIfMounted(() => setLoading(false));
    }
  }, [gql, runIfMounted]);

  React.useEffect(() => {
    if (skip) return;
    if (initRef.current) return;
    initRef.current = true;
    void load();
  }, [skip, load]);

  React.useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  return {
    user,
    loading,
    error,
    reload: load,
  };
}
