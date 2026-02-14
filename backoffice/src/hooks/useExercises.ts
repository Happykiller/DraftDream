// src/hooks/useExercises.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

import type { Visibility } from '@src/commons/visibility';

export type ExerciseVisibility = Visibility;

export interface Creator { id: string; email: string; }

export interface ExerciseLink {
  id: string;
  slug: string;
  label?: string | null;
  locale?: string | null;
}

export interface Exercise {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string | null;
  instructions?: string | null;
  series: string;
  repetitions: string;
  charge?: string | null;
  rest?: number | null;
  videoUrl?: string | null;
  visibility: ExerciseVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: Creator | null;
  categoryIds: string[];
  muscleIds: string[];
  equipmentIds?: string[] | null;
  tagIds?: string[] | null;
  categories?: ExerciseLink[];
  muscles?: ExerciseLink[];
  equipment?: ExerciseLink[];
  tags?: ExerciseLink[];
}

type ExerciseListPayload = {
  exercise_list: {
    items: Exercise[];
    total: number;
    page: number;
    limit: number;
  };
};

type GetPayload = { exercise_get: Exercise | null };

type CreatePayload = { exercise_create: Exercise };
type UpdatePayload = { exercise_update: Exercise };
type DeletePayload = { exercise_delete: boolean };

const LIST_Q = `
  query ListExercises($input: ListExercisesInput) {
    exercise_list(input: $input) {
      items {
        id slug locale label description instructions series repetitions
        charge rest videoUrl visibility createdBy createdAt updatedAt
        categoryIds muscleIds equipmentIds tagIds
        categories { id slug label locale }
        muscles { id slug label locale }
        equipment { id slug label locale }
        tags { id slug label locale }
        creator { id email }
      }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateExercise($input: CreateExerciseInput!) {
    exercise_create(input: $input) {
      id slug locale label description instructions series repetitions
      charge rest videoUrl visibility createdBy createdAt updatedAt
      categoryIds muscleIds equipmentIds tagIds
      categories { id slug label locale }
      muscles { id slug label locale }
      equipment { id slug label locale }
      tags { id slug label locale }
      creator { id email }
    }
  }
`;

const GET_Q = `
  query GetExercise($id: ID!) {
    exercise_get(id: $id) {
      id slug locale label description instructions series repetitions
      charge rest videoUrl visibility createdBy createdAt updatedAt
      categoryIds muscleIds equipmentIds tagIds
      categories { id slug label locale }
      muscles { id slug label locale }
      equipment { id slug label locale }
      tags { id slug label locale }
      creator { id email }
    }
  }
`;

const UPDATE_M = `
  mutation UpdateExercise($input: UpdateExerciseInput!) {
    exercise_update(input: $input) {
      id slug locale label description instructions series repetitions
      charge rest videoUrl visibility createdBy createdAt updatedAt
      categoryIds muscleIds equipmentIds tagIds
      categories { id slug label locale }
      muscles { id slug label locale }
      equipment { id slug label locale }
      tags { id slug label locale }
      creator { id email }
    }
  }
`;

const DELETE_M = `
  mutation DeleteExercise($id: ID!) { exercise_delete(id: $id) }
`;

export interface UseExercisesParams {
  page: number;  // 1-based
  limit: number;
  q: string;
}

export function useExercises({ page, limit, q }: UseExercisesParams) {
  const [items, setItems] = React.useState<Exercise[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<ExerciseListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListExercises',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.exercise_list.items ?? []);
      setTotal(data?.exercise_list.total ?? 0);
    } catch (e: any) {
      flashError(e?.message ?? 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, execute, gql, flashError]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: {
      series: string; repetitions: string; description?: string; instructions?: string;
      charge?: string; rest?: number; videoUrl?: string; visibility: ExerciseVisibility;
      categoryIds: string[];                        // required
      muscleIds: string[];                          // required (non-empty)
      equipmentIds?: string[];
      tagIds?: string[];
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreatePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateExercise',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Exercise created');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load]
  );

  const update = React.useCallback(
    async (input: {
      id: string;
      slug?: string; locale?: string; label?: string;
      series?: string; repetitions?: string; description?: string; instructions?: string;
      charge?: string; rest?: number; videoUrl?: string; visibility?: ExerciseVisibility;
      categoryIds?: string[];
      muscleIds?: string[];
      equipmentIds?: string[];
      tagIds?: string[];
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdatePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateExercise',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Exercise updated');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Update failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load]
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeletePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteExercise',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Exercise deleted');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Delete failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load]
  );

  const getExercise = React.useCallback(
    async (id: string): Promise<Exercise | null> => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<GetPayload>({
            query: GET_Q,
            variables: { id },
            operationName: 'GetExercise',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        return data?.exercise_get ?? null;
      } catch (e: any) {
        flashError(e?.message ?? 'Failed to load exercise');
        return null;
      }
    },
    [execute, gql, flashError],
  );

  return { items, total, loading, create, update, remove, reload: load, getExercise };
}
