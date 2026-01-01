import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';
import { session } from '@stores/session';

export const MealRecordState = {
    CREATE: 'CREATE',
    DRAFT: 'DRAFT',
    FINISH: 'FINISH',
} as const;

export type MealRecordState = typeof MealRecordState[keyof typeof MealRecordState];

export interface MealRecord {
    id: string;
    userId: string;
    mealPlanId: string;
    mealDayId: string;
    mealId: string;
    state: MealRecordState;
    createdAt: string;
    updatedAt: string;
}

type CreateMealRecordPayload = { mealRecord_create: MealRecord | null };
type UpdateMealRecordStatePayload = { mealRecord_updateState: MealRecord | null };
type GetMealRecordPayload = { mealRecord_get: MealRecord | null };

const LIST_QUERY = `
  query ListMealRecords($input: ListMealRecordsInput) {
    mealRecord_list(input: $input) {
      items {
        id
        userId
        mealPlanId
        mealDayId
        mealId
        state
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;

const CREATE_MUTATION = `
  mutation CreateMealRecord($input: CreateMealRecordInput!) {
    mealRecord_create(input: $input) {
      id
      userId
      mealPlanId
      mealDayId
      mealId
      state
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_STATE_MUTATION = `
  mutation UpdateMealRecordState($input: UpdateMealRecordInput!) {
    mealRecord_updateState(input: $input) {
      id
      userId
      mealPlanId
      mealDayId
      mealId
      state
      createdAt
      updatedAt
    }
  }
`;

const GET_QUERY = `
  query GetMealRecord($id: ID!) {
    mealRecord_get(id: $id) {
      id
      userId
      mealPlanId
      mealDayId
      mealId
      state
      createdAt
      updatedAt
    }
  }
`;

export function useMealRecords() {
    const { execute } = useAsyncTask();
    const flashError = useFlashStore((state) => state.error);
    const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
    const userId = session((state) => state.id);

    const get = React.useCallback(
        async (id: string): Promise<MealRecord | null> => {
            try {
                const { data, errors } = await execute(() =>
                    gql.send<GetMealRecordPayload>({
                        query: GET_QUERY,
                        operationName: 'GetMealRecord',
                        variables: { id },
                    }),
                );

                if (errors?.length) throw new Error(errors[0].message);
                return data?.mealRecord_get ?? null;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Fetch failed';
                flashError(message);
                return null;
            }
        },
        [execute, flashError, gql],
    );

    const create = React.useCallback(
        async (input: { mealPlanId: string; mealDayId: string; mealId: string }): Promise<MealRecord> => {
            try {
                const { data, errors } = await execute(() =>
                    gql.send<CreateMealRecordPayload>({
                        query: CREATE_MUTATION,
                        operationName: 'CreateMealRecord',
                        variables: {
                            input: {
                                userId,
                                mealPlanId: input.mealPlanId,
                                mealDayId: input.mealDayId,
                                mealId: input.mealId,
                            },
                        },
                    }),
                );

                if (errors?.length) throw new Error(errors[0].message);
                const createdRecord = data?.mealRecord_create;

                if (!createdRecord) {
                    throw new Error('Failed to create meal record');
                }

                return createdRecord;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Create failed';
                flashError(message);
                throw error;
            }
        },
        [execute, flashError, gql, userId],
    );

    const updateState = React.useCallback(
        async (id: string, state: MealRecordState): Promise<MealRecord> => {
            try {
                const { data, errors } = await execute(() =>
                    gql.send<UpdateMealRecordStatePayload>({
                        query: UPDATE_STATE_MUTATION,
                        operationName: 'UpdateMealRecordState',
                        variables: {
                            input: {
                                id,
                                state,
                            },
                        },
                    }),
                );

                if (errors?.length) throw new Error(errors[0].message);
                const updatedRecord = data?.mealRecord_updateState;

                if (!updatedRecord) {
                    throw new Error('Failed to update meal record state');
                }

                return updatedRecord;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Update failed';
                flashError(message);
                throw error;
            }
        },
        [execute, flashError, gql],
    );

    const list = React.useCallback(
        async (input: { userId?: string; limit?: number; page?: number; state?: MealRecordState } = {}): Promise<{ items: MealRecord[]; total: number }> => {
            try {
                const { data, errors } = await execute(() =>
                    gql.send<{ mealRecord_list: { items: MealRecord[]; total: number } }>({
                        query: LIST_QUERY,
                        operationName: 'ListMealRecords',
                        variables: { input },
                    }),
                );

                if (errors?.length) throw new Error(errors[0].message);
                return data?.mealRecord_list ?? { items: [], total: 0 };
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'List fetch failed';
                flashError(message);
                return { items: [], total: 0 };
            }
        },
        [execute, flashError, gql],
    );

    return { create, get, updateState, list };
}
