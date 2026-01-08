// src/hooks/useMealRecords.ts
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type MealRecordState = 'CREATE' | 'DRAFT' | 'FINISH';

export interface MealRecord {
  id: string;
  userId: string;
  mealPlanId: string;
  mealDayId: string;
  mealId: string;
  comment?: string | null;
  satisfactionRating?: number | null;
  state: MealRecordState;
  createdAt: string;
  updatedAt: string;
}

type MealRecordListPayload = {
  mealRecord_list: {
    items: MealRecord[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateMealRecordPayload = { mealRecord_create: MealRecord | null };
type UpdateMealRecordPayload = { mealRecord_updateState: MealRecord | null };

const LIST_QUERY = `
  query ListMealRecords($input: ListMealRecordsInput) {
    mealRecord_list(input: $input) {
      items {
        id
        userId
        mealPlanId
        mealDayId
        mealId
        comment
        satisfactionRating
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
      comment
      satisfactionRating
      state
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateMealRecord($input: UpdateMealRecordInput!) {
    mealRecord_updateState(input: $input) {
      id
      userId
      mealPlanId
      mealDayId
      mealId
      comment
      satisfactionRating
      state
      createdAt
      updatedAt
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteMealRecord($id: ID!) {
    mealRecord_delete(id: $id)
  }
`;

const HARD_DELETE_MUTATION = `
  mutation HardDeleteMealRecord($id: ID!) {
    mealRecord_hardDelete(id: $id)
  }
`;

export interface UseMealRecordsParams {
  page: number; // 1-based
  limit: number;
  userId?: string;
  mealPlanId?: string;
  state?: MealRecordState;
}

export function useMealRecords({
  page,
  limit,
  userId,
  mealPlanId,
  state,
}: UseMealRecordsParams) {
  const [items, setItems] = React.useState<MealRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((store) => store.error);
  const flashSuccess = useFlashStore((store) => store.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<MealRecordListPayload>({
          query: LIST_QUERY,
          variables: {
            input: {
              page,
              limit,
              userId: userId || undefined,
              mealPlanId: mealPlanId || undefined,
              state: state || undefined,
            },
          },
          operationName: 'ListMealRecords',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.mealRecord_list.items ?? []);
      setTotal(data?.mealRecord_list.total ?? 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load meal records';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [execute, gql, page, limit, userId, mealPlanId, state, flashError]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: {
      userId: string;
      mealPlanId: string;
      mealDayId: string;
      mealId: string;
      comment?: string;
      satisfactionRating?: number;
      state?: MealRecordState;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateMealRecordPayload>({
            query: CREATE_MUTATION,
            variables: { input },
            operationName: 'CreateMealRecord',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal record created');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Create failed';
        flashError(message);
        throw error;
      }
    },
    [execute, gql, flashError, flashSuccess, load],
  );

  const update = React.useCallback(
    async (input: { id: string; state: MealRecordState; comment?: string; satisfactionRating?: number }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateMealRecordPayload>({
            query: UPDATE_MUTATION,
            variables: { input },
            operationName: 'UpdateMealRecord',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal record updated');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Update failed';
        flashError(message);
        throw error;
      }
    },
    [execute, gql, flashError, flashSuccess, load],
  );

  const deleteRecord = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<{ mealRecord_delete: boolean }>({
            query: DELETE_MUTATION,
            variables: { id },
            operationName: 'DeleteMealRecord',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal record deleted');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Delete failed';
        flashError(message);
        throw error;
      }
    },
    [execute, gql, flashError, flashSuccess, load],
  );

  const hardDeleteRecord = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<{ mealRecord_hardDelete: boolean }>({
            query: HARD_DELETE_MUTATION,
            variables: { id },
            operationName: 'HardDeleteMealRecord',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal record hard deleted');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Hard delete failed';
        flashError(message);
        throw error;
      }
    },
    [execute, gql, flashError, flashSuccess, load],
  );

  return { items, total, loading, create, update, deleteRecord, hardDeleteRecord, reload: load };
}
