// src/services/graphql/coachAthletes.service.ts
import inversify from '@src/commons/inversify';

import type { CoachAthleteLink, CoachAthleteListResult } from '@app-types/coachAthletes';

import { GraphqlServiceFetch } from './graphql.service.fetch';

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
  coach { id first_name last_name email phone }
  athlete { id first_name last_name email phone }
`;

const LIST_QUERY = `
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

const GET_QUERY = `
  query CoachAthleteGet($id: ID!) {
    coachAthlete_get(id: $id) {
      ${COACH_ATHLETE_FIELDS}
    }
  }
`;

const UPDATE_MUTATION = `
  mutation CoachAthleteUpdate($input: UpdateCoachAthleteInput!) {
    coachAthlete_update(input: $input) {
      ${COACH_ATHLETE_FIELDS}
    }
  }
`;

type CoachAthleteListPayload = { coachAthlete_list: CoachAthleteListResult };

interface CoachAthleteGetOptions {
  linkId: string;
}

type CoachAthleteGetPayload = { coachAthlete_get: CoachAthleteLink | null };
type CoachAthleteUpdatePayload = { coachAthlete_update: CoachAthleteLink | null };

export interface CoachAthleteListInput {
  page?: number;
  limit?: number;
  coachId?: string | null;
  athleteId?: string | null;
  is_active?: boolean | null;
  includeArchived?: boolean;
}

export interface CoachAthleteUpdateInput {
  id: string;
  startDate?: string | null;
  endDate?: string | null;
  is_active?: boolean;
  note?: string | null;
}

function sanitizeListInput(input: CoachAthleteListInput): Record<string, unknown> {
  return {
    page: input.page ?? 1,
    limit: input.limit ?? 20,
    coachId: input.coachId?.trim() || undefined,
    athleteId: input.athleteId?.trim() || undefined,
    is_active: input.is_active ?? undefined,
    includeArchived: input.includeArchived,
  };
}

export async function coachAthleteList(input: CoachAthleteListInput): Promise<CoachAthleteListResult> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<CoachAthleteListPayload>({
    query: LIST_QUERY,
    operationName: 'CoachAthleteList',
    variables: { input: sanitizeListInput(input) },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.coachAthlete_list ?? {
    items: [],
    total: 0,
    page: input.page ?? 1,
    limit: input.limit ?? 20,
  };
}

export async function coachAthleteGet({ linkId }: CoachAthleteGetOptions): Promise<CoachAthleteLink | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<CoachAthleteGetPayload>({
    query: GET_QUERY,
    operationName: 'CoachAthleteGet',
    variables: { id: linkId },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.coachAthlete_get ?? null;
}

export async function coachAthleteUpdate(input: CoachAthleteUpdateInput): Promise<CoachAthleteLink | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<CoachAthleteUpdatePayload>({
    query: UPDATE_MUTATION,
    operationName: 'CoachAthleteUpdate',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.coachAthlete_update ?? null;
}
