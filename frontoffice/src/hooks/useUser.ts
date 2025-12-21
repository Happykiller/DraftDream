// src/hooks/useUser.ts
import * as React from 'react';

import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';
import { session } from '@stores/session';

export type UserProfileAddress = {
  name: string;
  city: string;
  code: string;
  country: string;
};

export type UserProfileCompany = {
  name: string;
  address?: UserProfileAddress | null;
};

export type UserProfile = {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: UserProfileAddress | null;
  company?: UserProfileCompany | null;
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
      address {
        name
        city
        code
        country
      }
      company {
        name
        address {
          name
          city
          code
          country
        }
      }
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
  const { execute } = useAsyncTask();

  const load = React.useCallback(async (): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await execute(() =>
        gql.send<MePayload>({
          query: ME_QUERY,
          operationName: 'Me',
        }),
      );
      const { data, errors } = response;

      if (errors?.length) {
        console.error('[useUser] GraphQL Errors:', errors);
        throw new Error(errors[0].message);
      }

      const profile = data?.me ?? null;

      // Sync session store
      if (profile) {
        session.setState((previous) => {
          const next = {
            id: profile.id,
            name_first: profile.first_name,
            name_last: profile.last_name,
            role: profile.type,
          } as const;

          const unchanged =
            previous.id === next.id &&
            previous.name_first === next.name_first &&
            previous.name_last === next.name_last &&
            previous.role === next.role;

          if (unchanged) {
            return previous;
          }

          return { ...previous, ...next };
        });
      }

      return profile;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load user profile';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [execute, gql]);

  // Fetch on mount with proper cleanup
  React.useEffect(() => {
    if (skip) return;

    let cancelled = false;

    const fetchUser = async () => {
      try {
        const profile = await load();
        if (!cancelled) {
          setUser(profile);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setUser(null);
          setError(e instanceof Error ? e.message : 'Failed to load user profile');
        }
      }
    };

    void fetchUser();

    return () => {
      cancelled = true;
    };
  }, [skip, load]);

  const reload = React.useCallback(async () => {
    try {
      const profile = await load();
      setUser(profile);
      setError(null);
    } catch (e: unknown) {
      setUser(null);
      setError(e instanceof Error ? e.message : 'Failed to load user profile');
    }
  }, [load]);

  return {
    user,
    loading,
    error,
    reload,
  };
}
