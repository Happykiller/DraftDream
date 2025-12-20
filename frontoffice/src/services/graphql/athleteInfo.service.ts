// src/services/graphql/athleteInfo.service.ts
import inversify from '@src/commons/inversify';

import type { AthleteInfo } from '@app-types/athleteInfo';

import { GraphqlServiceFetch } from './graphql.service.fetch';

const ATHLETE_INFO_BY_USER_Q = `
  query AthleteInfoByUser($input: ListAthleteInfosInput) {
    athleteInfo_list(input: $input) {
      items {
        id
        userId
        levelId
        objectiveIds
        activityPreferenceIds
        medicalConditions
        allergies
        objectives { id label }
        activityPreferences { id label }
      }
    }
  }
`;

const ATHLETE_INFO_UPDATE_MUTATION = `
  mutation UpdateAthleteInfo($input: UpdateAthleteInfoInput!) {
    athleteInfo_update(input: $input) {
      id
      userId
      levelId
      objectiveIds
      activityPreferenceIds
      medicalConditions
      allergies
      objectives { id label }
      activityPreferences { id label }
    }
  }
`;

type AthleteInfoListPayload = { athleteInfo_list: { items: AthleteInfo[] } | null };

interface AthleteInfoByUserOptions {
  userId: string;
}

export interface AthleteInfoUpdateInput {
  id: string;
  levelId?: string | null;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string | null;
  allergies?: string | null;
}

/** Loads the athlete information attached to a specific user. */
export async function athleteInfoGetByUser({ userId }: AthleteInfoByUserOptions): Promise<AthleteInfo | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const trimmedUserId = userId.trim();
  const { data, errors } = await graphql.send<AthleteInfoListPayload>({
    query: ATHLETE_INFO_BY_USER_Q,
    operationName: 'AthleteInfoByUser',
    variables: { input: { userId: trimmedUserId, limit: 1, page: 1 } },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.athleteInfo_list?.items?.[0] ?? null;
}

/** Updates the athlete information record for the authenticated athlete. */
export async function athleteInfoUpdate(input: AthleteInfoUpdateInput): Promise<AthleteInfo | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<{ athleteInfo_update: AthleteInfo | null }>({
    query: ATHLETE_INFO_UPDATE_MUTATION,
    operationName: 'UpdateAthleteInfo',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.athleteInfo_update ?? null;
}
