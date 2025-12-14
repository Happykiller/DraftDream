// src/services/graphql/athleteInfo.service.ts
import inversify from '@src/commons/inversify';

import type { AthleteInfo } from '@app-types/athleteInfo';

import { GraphqlServiceFetch } from './graphql.service.fetch';

const ATHLETE_INFO_GET_Q = `
  query AthleteInfoGet($id: ID!) {
    athleteInfo_get(id: $id) {
      id
      userId
      levelId
      objectiveIds
      activityPreferenceIds
      objectives { id label }
      activityPreferences { id label }
    }
  }
`;

type AthleteInfoGetPayload = { athleteInfo_get: AthleteInfo | null };

interface AthleteInfoGetOptions {
  athleteId: string;
}

/** Loads the athlete information attached to a specific athlete. */
export async function athleteInfoGet({ athleteId }: AthleteInfoGetOptions): Promise<AthleteInfo | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<AthleteInfoGetPayload>({
    query: ATHLETE_INFO_GET_Q,
    operationName: 'AthleteInfoGet',
    variables: { id: athleteId },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.athleteInfo_get ?? null;
}
