// src/hooks/useCoachAthletes.ts
// Comment in English: CRUD GraphQL hook for coach-athlete relations.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

type CoachAthleteGraphqlError = { message?: string };

const API_OUTDATED_MESSAGE =
  'Athlete management requires the latest API deployment. Please update the API before using this section.';

const coachAthleteSchemaError = (
  errors?: CoachAthleteGraphqlError[],
  fallback?: string,
): Error | null => {
  if (!errors?.length) return null;
  const normalized = errors.map((error) => (error?.message ?? '').toLowerCase());
  const schemaMismatch = normalized.some((message) =>
    ['createcoachathleteinput', 'updatecoachathleteinput', 'listcoachathletesinput', 'coachathlete_'].some((marker) =>
      message.includes(marker),
    ),
  );
  if (schemaMismatch) {
    return new Error(API_OUTDATED_MESSAGE);
  }
  const primary = errors[0]?.message ?? fallback ?? 'GraphQL request failed';
  return new Error(primary);
};

export interface CoachAthleteUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CoachAthlete {
  id: string;
  coachId: string;
  athleteId: string;
  startDate: string;
  endDate?: string | null;
  is_active: boolean;
  note?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  coach?: CoachAthleteUser | null;
  athlete?: CoachAthleteUser | null;
}

export interface CoachAthleteListResult {
  items: CoachAthlete[];
  total: number;
  page: number;
  limit: number;
}

const COACH_ATHLETE_FIELDS = `
  id
  coachId
  athleteId
  startDate
  endDate
  is_active
  note
  createdBy
  createdAt
  updatedAt
  deletedAt
  coach { id first_name last_name email }
  athlete { id first_name last_name email }
`;

const LIST_Q = `
  query CoachAthleteList($input: ListCoachAthletesInput) {
    coachAthlete_list(input: $input) {
      items {
        ${COACH_ATHLETE_FIELDS}
      }
      total
      page
      limit
    }
  }
`;

const CREATE_M = `
  mutation CreateCoachAthlete($input: CreateCoachAthleteInput!) {
    coachAthlete_create(input: $input) {
      ${COACH_ATHLETE_FIELDS}
    }
  }
`;

const UPDATE_M = `
  mutation UpdateCoachAthlete($input: UpdateCoachAthleteInput!) {
    coachAthlete_update(input: $input) {
      ${COACH_ATHLETE_FIELDS}
    }
  }
`;

const DELETE_M = `
  mutation DeleteCoachAthlete($id: ID!) {
    coachAthlete_delete(id: $id)
  }
`;

type CoachAthleteListPayload = { coachAthlete_list: CoachAthleteListResult };
type CreateCoachAthletePayload = { coachAthlete_create: CoachAthlete | null };
type UpdateCoachAthletePayload = { coachAthlete_update: CoachAthlete | null };
type DeleteCoachAthletePayload = { coachAthlete_delete: boolean };

export interface UseCoachAthletesParams {
  page: number;
  limit: number;
  coachId?: string | null;
  athleteId?: string | null;
  isActive?: boolean | null;
  includeArchived?: boolean;
}

export interface CoachAthleteCreateInput {
  coachId: string;
  athleteId: string;
  startDate: string;
  endDate?: string | null;
  is_active?: boolean;
  note?: string | null;
}

export interface CoachAthleteUpdateInput extends Partial<CoachAthleteCreateInput> {
  id: string;
}

export function useCoachAthletes(params: UseCoachAthletesParams) {
  const { page, limit, coachId, athleteId, isActive, includeArchived } = params;
  const [items, setItems] = React.useState<CoachAthlete[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(
    async (vars: {
      page: number;
      limit: number;
      coachId?: string | null;
      athleteId?: string | null;
      isActive?: boolean | null;
      includeArchived?: boolean;
    }) => {
      setLoading(true);
      try {
        const { data, errors } = await execute(() =>
          gql.send<CoachAthleteListPayload>({
            query: LIST_Q,
            variables: {
              input: {
                page: vars.page,
                limit: vars.limit,
                coachId: vars.coachId || undefined,
                athleteId: vars.athleteId || undefined,
                is_active: vars.isActive ?? undefined,
                includeArchived: vars.includeArchived,
              },
            },
            operationName: 'CoachAthleteList',
          }),
        );
        const gqlError = coachAthleteSchemaError(errors, 'Failed to load coach-athlete relations');
        if (gqlError) throw gqlError;
        setItems(data?.coachAthlete_list.items ?? []);
        setTotal(data?.coachAthlete_list.total ?? 0);
      } catch (error: any) {
        flashError(error?.message ?? 'Failed to load coach-athlete relations');
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, gql],
  );

  const lastSigRef = React.useRef<string | null>(null);
  const sig = `${page}|${limit}|${coachId || ''}|${athleteId || ''}|${isActive ?? 'any'}|${includeArchived ? '1' : '0'}`;

  React.useEffect(() => {
    if (lastSigRef.current === sig) return;
    lastSigRef.current = sig;
    void load({ page, limit, coachId, athleteId, isActive, includeArchived });
  }, [sig, load, page, limit, coachId, athleteId, isActive, includeArchived]);

  const create = React.useCallback(
    async (input: CoachAthleteCreateInput) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateCoachAthletePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateCoachAthlete',
          }),
        );
        const gqlError = coachAthleteSchemaError(errors, 'Creation failed');
        if (gqlError) throw gqlError;
        flashSuccess('Relation created');
        await load({ page, limit, coachId, athleteId, isActive, includeArchived });
      } catch (error: any) {
        flashError(error?.message ?? 'Creation failed');
        throw error;
      }
    },
    [athleteId, coachId, execute, flashError, flashSuccess, gql, includeArchived, isActive, limit, load, page],
  );

  const update = React.useCallback(
    async (input: CoachAthleteUpdateInput) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateCoachAthletePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateCoachAthlete',
          }),
        );
        const gqlError = coachAthleteSchemaError(errors, 'Update failed');
        if (gqlError) throw gqlError;
        flashSuccess('Relation updated');
        await load({ page, limit, coachId, athleteId, isActive, includeArchived });
      } catch (error: any) {
        flashError(error?.message ?? 'Update failed');
        throw error;
      }
    },
    [athleteId, coachId, execute, flashError, flashSuccess, gql, includeArchived, isActive, limit, load, page],
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeleteCoachAthletePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteCoachAthlete',
          }),
        );
        const gqlError = coachAthleteSchemaError(errors, 'Delete failed');
        if (gqlError) throw gqlError;
        flashSuccess('Relation archived');
        await load({ page, limit, coachId, athleteId, isActive, includeArchived });
      } catch (error: any) {
        flashError(error?.message ?? 'Delete failed');
        throw error;
      }
    },
    [athleteId, coachId, execute, flashError, flashSuccess, gql, includeArchived, isActive, limit, load, page],
  );

  return {
    items,
    total,
    loading,
    create,
    update,
    remove,
    reload: () => load({ page, limit, coachId, athleteId, isActive, includeArchived }),
  };
}
