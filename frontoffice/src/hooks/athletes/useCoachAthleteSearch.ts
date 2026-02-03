import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type AthleteSearchOption = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
};

interface AthleteListPayload {
  coachAthlete_list: {
    items: Array<{ athlete: AthleteSearchOption }>;
  };
}

interface UseCoachAthleteSearchOptions {
  enabled?: boolean;
  limit?: number;
}

const ATHLETE_CACHE = new Map<string, AthleteSearchOption[]>();

const LIST_COACH_ATHLETES_QUERY = `
  query ListCoachAthletes($input: ListCoachAthletesInput) {
    coachAthlete_list(input: $input) {
      items {
        athlete {
          id
          email
          first_name
          last_name
        }
      }
    }
  }
`;

/** Builds the athlete label with a fallback to email when the full name is missing. */
export function formatAthleteLabel({
  first_name,
  last_name,
  email,
}: AthleteSearchOption): string {
  const displayName = [first_name, last_name]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ')
    .trim();

  return displayName || email;
}

/** Fetch coach athletes with a debounced query and shared cache for autocomplete fields. */
export function useCoachAthleteSearch(
  options: UseCoachAthleteSearchOptions = {},
): {
  options: AthleteSearchOption[];
  loading: boolean;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  reset: () => void;
} {
  const { enabled = true, limit = 25 } = options;
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const { t } = useTranslation();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<AthleteSearchOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  const loadAthletes = React.useCallback(
    async (search: string) => {
      const key = search.trim().toLowerCase();

      if (ATHLETE_CACHE.has(key)) {
        setResults(ATHLETE_CACHE.get(key) ?? []);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, errors } = await execute(() =>
          gql.send<AthleteListPayload>({
            query: LIST_COACH_ATHLETES_QUERY,
            operationName: 'ListCoachAthletes',
            variables: {
              input: {
                page: 1,
                limit,
                q: search.trim() || undefined,
              },
            },
          }),
        );

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        const items = data?.coachAthlete_list.items.map((item) => item.athlete) ?? [];
        ATHLETE_CACHE.set(key, items);
        setResults(items);
      } catch (error) {
        console.error('[useCoachAthleteSearch] Failed to load coach athletes', error);
        flashError(t('athletes.notifications.load_failure'));
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, gql, limit, t],
  );

  React.useEffect(() => {
    if (!enabled) {
      setResults([]);
      setLoading(false);
      return;
    }

    void loadAthletes(debouncedQuery);
  }, [debouncedQuery, enabled, loadAthletes]);

  const reset = React.useCallback(() => {
    setQuery('');
    setResults([]);
    setLoading(false);
    if (enabled) {
      void loadAthletes('');
    }
  }, [enabled, loadAthletes]);

  return {
    options: results,
    loading,
    query,
    setQuery,
    reset,
  };
}
