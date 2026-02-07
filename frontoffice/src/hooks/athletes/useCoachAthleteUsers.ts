// src/hooks/athletes/useCoachAthleteUsers.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { UserType } from '@src/commons/enums';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { coachAthleteList } from '@services/graphql/coachAthletes.service';
import type { CoachAthleteLink } from '@app-types/coachAthletes';
import type { User } from '@src/hooks/useUsers';

interface UseCoachAthleteUsersParams {
  coachId?: string | null;
  search?: string;
}

interface UseCoachAthleteUsersResult {
  items: User[];
  loading: boolean;
  reload: () => Promise<void>;
}

const PAGE = 1;
const LIMIT = 250;

/** Converts a coach-athlete link into a lightweight user representation. */
function mapLinkToUser(link: CoachAthleteLink): User | null {
  const summary = link.athlete;
  const id = summary?.id ?? link.athleteId;
  if (!id) {
    return null;
  }

  return {
    id,
    type: UserType.Athlete,
    first_name: summary?.first_name ?? '',
    last_name: summary?.last_name ?? '',
    email: summary?.email ?? '',
    phone: null,
    address: null,
    company: null,
    createdAt: link.createdAt ?? null,
    updatedAt: link.updatedAt ?? null,
    is_active: true,
    createdBy: link.createdBy,
  };
}

/** Determines whether the relation is currently usable according to the configured window. */
function isRelationEligible(link: CoachAthleteLink, now: number): boolean {
  if (!link.is_active) {
    return false;
  }

  if (link.startDate) {
    const start = Date.parse(link.startDate);
    if (Number.isNaN(start) || start > now) {
      return false;
    }
  }

  if (link.endDate) {
    const end = Date.parse(link.endDate);
    if (!Number.isNaN(end) && now > end) {
      return false;
    }
  }

  return true;
}

/**
 * Returns the list of eligible athletes for a coach, filtered client side by the search string.
 */
export function useCoachAthleteUsers({
  coachId,
  search,
}: UseCoachAthleteUsersParams): UseCoachAthleteUsersResult {
  const [links, setLinks] = React.useState<CoachAthleteLink[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const { t } = useTranslation();

  const load = React.useCallback(async () => {
    if (!coachId) {
      setLinks([]);
      return;
    }

    setLoading(true);
    try {
      const result = await execute(() =>
        coachAthleteList({
          coachId,
          page: PAGE,
          limit: LIMIT,
          is_active: true,
          includeArchived: false,
        }),
      );
      setLinks(result.items ?? []);
    } catch (error) {
      console.error('[useCoachAthleteUsers] Failed to load coach-athlete relations', error);
      flashError(t('athletes.notifications.load_failure'));
    } finally {
      setLoading(false);
    }
  }, [coachId, execute, flashError, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const collator = React.useMemo(
    () => new Intl.Collator(undefined, { sensitivity: 'base', usage: 'search' }),
    [],
  );

  const items = React.useMemo(() => {
    const now = Date.now();
    const normalizedSearch = search?.trim().toLowerCase() ?? '';
    const deduped = new Map<string, User>();

    for (const link of links) {
      if (!isRelationEligible(link, now)) {
        continue;
      }

      const user = mapLinkToUser(link);
      if (!user) {
        continue;
      }

      const haystack = `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .trim();
      if (normalizedSearch && !haystack.includes(normalizedSearch)) {
        continue;
      }

      deduped.set(user.id, user);
    }

    return Array.from(deduped.values()).sort((a, b) => {
      const labelA = `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || a.email;
      const labelB = `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim() || b.email;
      return collator.compare(labelA, labelB);
    });
  }, [collator, links, search]);

  return {
    items,
    loading,
    reload: load,
  };
}
