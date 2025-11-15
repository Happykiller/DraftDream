// src/services/graphql/programs.service.ts
import type { Program } from '@hooks/programs/usePrograms';

import inversify from '@src/commons/inversify';

import { GraphqlServiceFetch } from './graphql.service.fetch';

const PROGRAM_GET_Q = `
  query GetProgram($id: ID!) {
    program_get(id: $id) {
      id
      slug
      locale
      label
      duration
      frequency
      description
      sessions {
        id
        templateSessionId
        slug
        locale
        label
        durationMin
        description
        exercises {
          id
          templateExerciseId
          label
          description
          instructions
          series
          repetitions
          charge
          restSeconds
          videoUrl
          categoryIds
          categories {
            id
            label
          }
          muscleIds
          muscles {
            id
            label
          }
          equipmentIds
          equipments {
            id
            label
          }
          tagIds
          tags {
            id
            label
          }
        }
      }
      userId
      createdBy
      createdAt
      updatedAt
      creator {
        id
        email
        first_name
        last_name
      }
      athlete {
        id
        email
        first_name
        last_name
      }
    }
  }
`;

type ProgramGetPayload = {
  program_get: Program | null;
};

interface ProgramGetOptions {
  programId: string;
}

/**
 * Retrieves a program details by identifier using the shared GraphQL fetcher.
 */
export async function programGet({ programId }: ProgramGetOptions): Promise<Program | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ProgramGetPayload>({
    query: PROGRAM_GET_Q,
    operationName: 'GetProgram',
    variables: { id: programId },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.program_get ?? null;
}
