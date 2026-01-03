import * as React from 'react';

import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';
import { session } from '@stores/session';

export const ProgramRecordState = {
    CREATE: 'CREATE',
    DRAFT: 'DRAFT',
    FINISH: 'FINISH',
} as const;

export type ProgramRecordState = typeof ProgramRecordState[keyof typeof ProgramRecordState];

export interface ProgramRecord {
    id: string;
    userId: string;
    programId: string;
    sessionId: string;
    comment?: string | null;
    satisfactionRating?: number | null;
    durationMinutes?: number | null;
    difficultyRating?: number | null;
    sessionSnapshot?: ProgramRecordSessionSnapshot | null;
    recordData?: ProgramRecordData | null;
    state: ProgramRecordState;
    createdAt: string;
    updatedAt: string;
}

export interface ProgramRecordExerciseSet {
    index: number;
    repetitions?: string | null;
    charge?: string | null;
    done?: boolean | null;
}

export interface ProgramRecordExerciseRecordData {
    exerciseId: string;
    notes?: string | null;
    sets: ProgramRecordExerciseSet[];
}

export interface ProgramRecordData {
    exercises: ProgramRecordExerciseRecordData[];
}

export interface ProgramRecordExerciseSnapshot {
    id: string;
    templateExerciseId?: string | null;
    label: string;
    description?: string | null;
    instructions?: string | null;
    series?: string | null;
    repetitions?: string | null;
    charge?: string | null;
    restSeconds?: number | null;
    videoUrl?: string | null;
    categoryIds?: string[] | null;
    muscleIds?: string[] | null;
    equipmentIds?: string[] | null;
    tagIds?: string[] | null;
}

export interface ProgramRecordSessionSnapshot {
    id: string;
    templateSessionId?: string | null;
    slug?: string | null;
    locale?: string | null;
    label: string;
    durationMin: number;
    description?: string | null;
    exercises: ProgramRecordExerciseSnapshot[];
}

type CreateProgramRecordPayload = { programRecord_create: ProgramRecord };
type UpdateProgramRecordStatePayload = { programRecord_updateState: ProgramRecord };
type GetProgramRecordPayload = { programRecord_get: ProgramRecord };

const CREATE_M = `
  mutation CreateProgramRecord($input: CreateProgramRecordInput!) {
    programRecord_create(input: $input) {
      id
      userId
      programId
      sessionId
      sessionSnapshot {
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
          muscleIds
          equipmentIds
          tagIds
        }
      }
      recordData {
        exercises {
          exerciseId
          notes
          sets {
            index
            repetitions
            charge
            done
          }
        }
      }
      comment
      satisfactionRating
      durationMinutes
      difficultyRating
      state
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_STATE_M = `
  mutation UpdateProgramRecordState($input: UpdateProgramRecordInput!) {
    programRecord_updateState(input: $input) {
      id
      state
      sessionSnapshot {
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
          muscleIds
          equipmentIds
          tagIds
        }
      }
      recordData {
        exercises {
          exerciseId
          notes
          sets {
            index
            repetitions
            charge
            done
          }
        }
      }
      comment
      satisfactionRating
      durationMinutes
      difficultyRating
      updatedAt
    }
  }
`;

const GET_Q = `
  query GetProgramRecord($id: ID!) {
    programRecord_get(id: $id) {
      id
      userId
      programId
      sessionId
      sessionSnapshot {
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
          muscleIds
          equipmentIds
          tagIds
        }
      }
      recordData {
        exercises {
          exerciseId
          notes
          sets {
            index
            repetitions
            charge
            done
          }
        }
      }
      comment
      satisfactionRating
      durationMinutes
      difficultyRating
      state
      createdAt
      updatedAt
    }
  }
`;

export function useProgramRecords() {
    const { execute } = useAsyncTask();
    const flashError = useFlashStore((state) => state.error);
    const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
    const userId = session((state) => state.id);

    const get = React.useCallback(
        async (id: string): Promise<ProgramRecord | null> => {
            try {
                const { data, errors } = await execute(() =>
                    gql.send<GetProgramRecordPayload>({
                        query: GET_Q,
                        operationName: 'GetProgramRecord',
                        variables: { id },
                    })
                );

                if (errors?.length) throw new Error(errors[0].message);
                return data?.programRecord_get ?? null;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Fetch failed';
                flashError(message);
                return null;
            }
        },
        [execute, flashError, gql]
    );

    const create = React.useCallback(
        async (
            programId: string,
            sessionId: string,
            payload?: { comment?: string; satisfactionRating?: number },
        ): Promise<ProgramRecord> => {
            try {
                const { data, errors } = await execute(() =>
                    gql.send<CreateProgramRecordPayload>({
                        query: CREATE_M,
                        operationName: 'CreateProgramRecord',
                        variables: {
                            input: {
                                userId,
                                programId,
                                sessionId,
                                comment: payload?.comment,
                                satisfactionRating: payload?.satisfactionRating,
                            },
                        },
                    })
                );

                if (errors?.length) throw new Error(errors[0].message);
                const createdRecord = data?.programRecord_create;

                if (!createdRecord) {
                    throw new Error('Failed to create program record');
                }

                return createdRecord;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Create failed';
                flashError(message);
                throw error;
            }
        },
        [execute, flashError, gql, userId]
    );

    const updateState = React.useCallback(
        async (
            id: string,
            state: ProgramRecordState,
            payload?: {
                comment?: string;
                satisfactionRating?: number;
                durationMinutes?: number;
                difficultyRating?: number;
                recordData?: ProgramRecordData;
            },
        ): Promise<ProgramRecord> => {
            try {
                const { data, errors } = await execute(() =>
                    gql.send<UpdateProgramRecordStatePayload>({
                        query: UPDATE_STATE_M,
                        operationName: 'UpdateProgramRecordState',
                        variables: {
                            input: {
                                id,
                                state,
                                comment: payload?.comment,
                                satisfactionRating: payload?.satisfactionRating,
                                durationMinutes: payload?.durationMinutes,
                                difficultyRating: payload?.difficultyRating,
                                recordData: payload?.recordData,
                            },
                        },
                    })
                );

                if (errors?.length) throw new Error(errors[0].message);
                const updatedRecord = data?.programRecord_updateState;

                if (!updatedRecord) {
                    throw new Error('Failed to update program record state');
                }

                return updatedRecord;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Update failed';
                flashError(message);
                throw error;
            }
        },
        [execute, flashError, gql]
    );

    const list = React.useCallback(
        async (input: { userId?: string; limit?: number; page?: number; state?: ProgramRecordState } = {}): Promise<{ items: ProgramRecord[]; total: number }> => {
            try {
                const { data, errors } = await execute(() =>
                    gql.send<{ programRecord_list: { items: ProgramRecord[]; total: number } }>({
                        query: `
                          query ListProgramRecords($input: ListProgramRecordsInput) {
                            programRecord_list(input: $input) {
                              items {
                                id
                                userId
                                programId
                                sessionId
                                sessionSnapshot {
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
                                    muscleIds
                                    equipmentIds
                                    tagIds
                                  }
                                }
                                recordData {
                                  exercises {
                                    exerciseId
                                    notes
                                    sets {
                                      index
                                      repetitions
                                      charge
                                      done
                                    }
                                  }
                                }
                                comment
                                satisfactionRating
                                durationMinutes
                                difficultyRating
                                state
                                createdAt
                                updatedAt
                              }
                              total
                            }
                          }
                        `,
                        operationName: 'ListProgramRecords',
                        variables: { input },
                    })
                );

                if (errors?.length) throw new Error(errors[0].message);
                return data?.programRecord_list ?? { items: [], total: 0 };
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'List fetch failed';
                flashError(message);
                return { items: [], total: 0 };
            }
        },
        [execute, flashError, gql]
    );

    return { create, get, updateState, list };
}
