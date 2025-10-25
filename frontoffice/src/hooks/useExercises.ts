// src/hooks/useExercises.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ExerciseVisibility = 'PRIVATE' | 'PUBLIC';
export type ExerciseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type CreateExerciseInput = {
  slug: string;
  locale: string;
  label: string;
  level: ExerciseLevel;
  series: string;
  repetitions: string;
  description?: string;
  instructions?: string;
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility: ExerciseVisibility;
  categoryIds: string[];
  muscleIds: string[];
  equipmentIds?: string[];
  tagIds?: string[];
};

export type UpdateExerciseInput = {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
  level?: ExerciseLevel;
  series?: string;
  repetitions?: string;
  description?: string | null;
  instructions?: string | null;
  charge?: string | null;
  rest?: number | null;
  videoUrl?: string | null;
  visibility?: ExerciseVisibility;
  categoryIds?: string[];
  muscleIds?: string[];
  equipmentIds?: string[];
  tagIds?: string[];
};

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
  categoryIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: Creator | null;
  categories?: { id: string; label: string }[];
  muscles?: { id: string; label: string }[];
  equipment?: { id: string; label: string }[];
  tags?: { id: string; label: string }[];
}

type ExerciseListPayload = {
  exercise_list: {
    items: Exercise[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreatePayload = { exercise_create: Exercise | null };
type UpdatePayload = { exercise_update: Exercise };
type DeletePayload = { exercise_delete: boolean };

const LIST_Q = `
  query ListExercises($input: ListExercisesInput) {
    exercise_list(input: $input) {
      items {
        id slug locale label description instructions level series repetitions
        charge rest videoUrl visibility categoryIds createdBy createdAt updatedAt
        creator { id email }
        categories { id label }
        muscles { id label }
        equipment { id label }
        tags { id label }
      }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateExercise($input: CreateExerciseInput!) {
    exercise_create(input: $input) {
      id slug locale label description instructions level series repetitions
      charge rest videoUrl visibility categoryIds createdBy createdAt updatedAt
      creator { id email }
      categories { id label }
      muscles { id label }
      equipment { id label }
      tags { id label }
    }
  }
`;

const UPDATE_M = `
  mutation UpdateExercise($input: UpdateExerciseInput!) {
    exercise_update(input: $input) {
      id slug locale label description instructions level series repetitions
      charge rest videoUrl visibility categoryIds createdBy createdAt updatedAt
      creator { id email }
      categories { id label }
      muscles { id label }
      equipment { id label }
      tags { id label }
    }
  }
`;

const DELETE_M = `
  mutation DeleteExercise($id: ID!) { exercise_softDelete(id: $id) }
`;

export interface UseExercisesParams {
  page: number;  // 1-based
  limit: number;
  q: string;
  visibility?: ExerciseVisibility;
  level?: ExerciseLevel;
  categoryIds?: string[];
  locale?: string;
  createdBy?: string;
}

export function useExercises({
  page,
  limit,
  q,
  visibility,
  level,
  categoryIds,
  locale,
  createdBy,
}: UseExercisesParams) {
  const [items, setItems] = React.useState<Exercise[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const trimmedQuery = q.trim();
      const { data, errors } = await execute(() =>
        gql.send<ExerciseListPayload>({
          query: LIST_Q,
          variables: {
            input: {
              page,
              limit,
              ...(trimmedQuery ? { q: trimmedQuery } : {}),
              ...(visibility ? { visibility } : {}),
              ...(level ? { level } : {}),
              ...(categoryIds && categoryIds.length ? { categoryIds } : {}),
              ...(locale ? { locale } : {}),
              ...(createdBy ? { createdBy } : {}),
            },
          },
          operationName: 'ListExercises',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.exercise_list.items ?? []);
      setTotal(data?.exercise_list.total ?? 0);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load exercises';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [categoryIds, createdBy, execute, flashError, gql, level, limit, locale, page, q, visibility]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: CreateExerciseInput) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<CreatePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateExercise',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);

        const created = data?.exercise_create ?? undefined;
        if (!created) {
          flashError(
            t('programs-coatch.builder.library.create_dialog.flash.failure', {
              defaultValue: 'Unable to create the exercise template.',
            }),
          );
          return undefined;
        }

        flashSuccess(
          t('programs-coatch.builder.library.create_dialog.flash.success', {
            defaultValue: 'Exercise template created successfully.',
          }),
        );

        let existed = false;
        setItems((previous) => {
          existed = previous.some((item) => item.id === created.id);
          const next = [created, ...previous.filter((item) => item.id !== created.id)];
          return next.slice(0, limit);
        });
        if (!existed) {
          setTotal((current) => current + 1);
        }

        return created;
      } catch (error: unknown) {
        const fallback = t('programs-coatch.builder.library.create_dialog.flash.failure', {
          defaultValue: 'Unable to create the exercise template.',
        });
        const message = error instanceof Error ? error.message : fallback;
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, limit, t]
  );

  const update = React.useCallback(
    async (input: UpdateExerciseInput) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<UpdatePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateExercise',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);

        const updated = data?.exercise_update ?? undefined;
        if (!updated) {
          flashError(
            t('programs-coatch.builder.library.edit_dialog.flash.failure', {
              defaultValue: 'Unable to update the exercise template.',
            }),
          );
          return undefined;
        }

        flashSuccess(
          t('programs-coatch.builder.library.edit_dialog.flash.success', {
            defaultValue: 'Exercise template updated successfully.',
          }),
        );

        setItems((previous) => {
          const exists = previous.some((item) => item.id === updated.id);
          if (!exists) {
            return [updated, ...previous].slice(0, limit);
          }
          return previous.map((item) => (item.id === updated.id ? updated : item));
        });

        return updated;
      } catch (error: unknown) {
        const fallback = t('programs-coatch.builder.library.edit_dialog.flash.failure', {
          defaultValue: 'Unable to update the exercise template.',
        });
        const message = error instanceof Error ? error.message : fallback;
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, limit, t],
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
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Delete failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load]
  );

  return { items, total, loading, create, update, remove, reload: load };
}
