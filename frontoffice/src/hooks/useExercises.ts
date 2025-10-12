// src/hooks/useExercises.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ExerciseVisibility = 'PRIVATE' | 'PUBLIC';
export type ExerciseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Creator { id: string; email: string; }

export interface Exercise {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string | null;
  instructions?: string | null;
  level: ExerciseLevel;
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
}

type ExerciseListPayload = {
  exercise_list: {
    items: Exercise[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreatePayload = { exercise_create: Exercise };
type UpdatePayload = { exercise_update: Exercise };
type DeletePayload = { exercise_delete: boolean };

const LIST_Q = `
  query ListExercises($input: ListExercisesInput) {
    exercise_list(input: $input) {
      items {
        id slug locale label description instructions level series repetitions
        charge rest videoUrl visibility createdBy createdAt updatedAt
        creator { id email }
      }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateExercise($input: CreateExerciseInput!) {
    exercise_create(input: $input) {
      id slug locale label description instructions level series repetitions
      charge rest videoUrl visibility createdBy createdAt updatedAt
      creator { id email }
    }
  }
`;

const UPDATE_M = `
  mutation UpdateExercise($input: UpdateExerciseInput!) {
    exercise_update(input: $input) {
      id slug locale label description instructions level series repetitions
      charge rest videoUrl visibility createdBy createdAt updatedAt
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
  const flash = useFlashStore();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await gql.send<ExerciseListPayload>({
        query: LIST_Q,
        variables: { input: { page, limit, q: q || undefined } },
        operationName: 'ListExercises',
      });
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.exercise_list.items ?? []);
      setTotal(data?.exercise_list.total ?? 0);
    } catch (e: any) {
      flash.error(e?.message ?? 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, gql, flash]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: {
      slug: string; locale: string; label: string; level: ExerciseLevel;
      series: string; repetitions: string; description?: string; instructions?: string;
      charge?: string; rest?: number; videoUrl?: string; visibility: ExerciseVisibility;
      categoryId: string;                           // required
      primaryMuscleIds: string[];                   // required (non-empty)
      secondaryMuscleIds?: string[];
      equipmentIds?: string[];
      tagIds?: string[];
    }) => {
      try {
        const { errors } = await gql.send<CreatePayload>({
          query: CREATE_M, variables: { input }, operationName: 'CreateExercise',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Exercise created');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  const update = React.useCallback(
    async (input: {
      id: string;
      slug?: string; locale?: string; label?: string; level?: ExerciseLevel;
      series?: string; repetitions?: string; description?: string; instructions?: string;
      charge?: string; rest?: number; videoUrl?: string; visibility?: ExerciseVisibility;
      categoryId?: string | null;
      primaryMuscleIds?: string[];
      secondaryMuscleIds?: string[];
      equipmentIds?: string[];
      tagIds?: string[];
    }) => {
      try {
        const { errors } = await gql.send<UpdatePayload>({
          query: UPDATE_M, variables: { input }, operationName: 'UpdateExercise',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Exercise updated');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Update failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await gql.send<DeletePayload>({
          query: DELETE_M, variables: { id }, operationName: 'DeleteExercise',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Exercise deleted');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Delete failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  return { items, total, loading, create, update, remove, reload: load };
}
