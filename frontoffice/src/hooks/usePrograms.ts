// src/hooks/usePrograms.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface ProgramUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface ProgramSessionExercise {
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
  level?: string | null;
  categories?: { id: string; label: string }[];
  muscles?: { id: string; label: string }[];
  equipment?: { id: string; label: string }[];
  tags?: { id: string; label: string }[];
}

export interface ProgramSession {
  id: string;
  templateSessionId?: string | null;
  slug?: string | null;
  locale?: string | null;
  label: string;
  durationMin: number;
  description?: string | null;
  exercises: ProgramSessionExercise[];
}

export interface Program {
  id: string;
  slug: string;
  locale: string;
  label: string;
  duration: number;
  frequency: number;
  description?: string | null;
  userId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: ProgramUser | null;
  athlete?: ProgramUser | null;
  sessions: ProgramSession[];
}

type ProgramListPayload = {
  program_list: {
    items: Program[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateProgramPayload = { program_create: Program };
type UpdateProgramPayload = { program_update: Program };
type DeleteProgramPayload = { program_softDelete: boolean };

type ExerciseGetPayload = {
  exercise_get: {
    id: string;
    label: string;
    description?: string | null;
    instructions?: string | null;
    series: string;
    repetitions: string;
    charge?: string | null;
    rest?: number | null;
    videoUrl?: string | null;
    level?: string | null;
    categories: { id: string; label: string }[];
    muscles: { id: string; label: string }[];
    equipment?: { id: string; label: string }[];
    tags?: { id: string; label: string }[];
  } | null;
};

const LIST_Q = `
  query ListPrograms($input: ListProgramsInput) {
    program_list(input: $input) {
      items {
        id
        slug
        locale
        label
        duration
        frequency
        description
        sessions {
          id templateSessionId slug locale label durationMin description
          exercises {
            id templateExerciseId label description instructions series repetitions charge restSeconds videoUrl level
          }
        }
        userId
        createdBy
        createdAt
        updatedAt
        creator { id email first_name last_name }
        athlete { id email first_name last_name }
      }
      total
      page
      limit
    }
  }
`;

const CREATE_M = `
  mutation CreateProgram($input: CreateProgramInput!) {
    program_create(input: $input) {
      id
      slug
      locale
      label
      duration
      frequency
      description
      sessions {
        id templateSessionId slug locale label durationMin description
        exercises {
          id templateExerciseId label description instructions series repetitions charge restSeconds videoUrl level
        }
      }
      userId
      createdBy
      createdAt
      updatedAt
      creator { id email first_name last_name }
      athlete { id email first_name last_name }
    }
  }
`;

const UPDATE_M = `
  mutation UpdateProgram($input: UpdateProgramInput!) {
    program_update(input: $input) {
      id
      slug
      locale
      label
      duration
      frequency
      description
      sessions {
        id templateSessionId slug locale label durationMin description
        exercises {
          id templateExerciseId label description instructions series repetitions charge restSeconds videoUrl level
        }
      }
      userId
      createdBy
      createdAt
      updatedAt
      creator { id email first_name last_name }
      athlete { id email first_name last_name }
    }
  }
`;

const DELETE_M = `
  mutation SoftDeleteProgram($id: ID!) {
    program_softDelete(id: $id)
  }
`;

const EXERCISE_GET_Q = `
  query GetExercise($id: ID!) {
    exercise_get(id: $id) {
      id
      label
      description
      instructions
      series
      repetitions
      charge
      rest
      videoUrl
      level
      categories { id label }
      muscles { id label }
      equipment { id label }
      tags { id label }
    }
  }
`;

export interface UseProgramsParams {
  page: number; // 1-based
  limit: number;
  q: string;
  createdBy?: string;
  userId?: string;
}

export function usePrograms({ page, limit, q, createdBy, userId }: UseProgramsParams) {
  const [items, setItems] = React.useState<Program[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { t, i18n } = useTranslation();
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  type ExerciseMetadata = NonNullable<ExerciseGetPayload['exercise_get']>;

  const exerciseMetadataCacheRef = React.useRef<Map<string, ExerciseMetadata | null>>(new Map());

  /**
   * Blends template exercise metadata into a program exercise without overriding explicit overrides.
   */
  const enrichExerciseWithMetadata = React.useCallback(
    (exercise: ProgramSessionExercise): ProgramSessionExercise => {
      const baseId = exercise.templateExerciseId ?? exercise.id;
      const metadata = baseId ? exerciseMetadataCacheRef.current.get(baseId) ?? null : null;

      if (!metadata) {
        return {
          ...exercise,
          categories: exercise.categories ?? [],
          muscles: exercise.muscles ?? [],
          equipment: exercise.equipment ?? [],
          tags: exercise.tags ?? [],
        };
      }

      return {
        ...exercise,
        description: exercise.description ?? metadata.description ?? null,
        instructions: exercise.instructions ?? metadata.instructions ?? null,
        charge: exercise.charge ?? metadata.charge ?? null,
        restSeconds:
          exercise.restSeconds != null && Number.isFinite(exercise.restSeconds)
            ? exercise.restSeconds
            : metadata.rest ?? null,
        videoUrl: exercise.videoUrl ?? metadata.videoUrl ?? null,
        level: exercise.level ?? metadata.level ?? null,
        series: exercise.series ?? metadata.series ?? '',
        repetitions: exercise.repetitions ?? metadata.repetitions ?? '',
        categories: metadata.categories ?? [],
        muscles: metadata.muscles ?? [],
        equipment: metadata.equipment ?? [],
        tags: metadata.tags ?? [],
      };
    },
    [],
  );

  /**
   * Resolves and caches template exercise metadata for the provided identifiers.
   */
  const fetchMissingExerciseMetadata = React.useCallback(
    async (exerciseIds: string[]) => {
      const cache = exerciseMetadataCacheRef.current;
      const missingIds = exerciseIds.filter((id) => id && !cache.has(id));

      if (!missingIds.length) {
        return cache;
      }

      await Promise.all(
        missingIds.map(async (exerciseId) => {
          try {
            const { data, errors } = await gql.send<ExerciseGetPayload>({
              query: EXERCISE_GET_Q,
              operationName: 'GetExercise',
              variables: { id: exerciseId },
            });

            if (errors?.length) {
              throw new Error(errors[0].message);
            }

            cache.set(exerciseId, data?.exercise_get ?? null);
          } catch (error) {
            cache.set(exerciseId, null);
            // eslint-disable-next-line no-console
            console.warn(`Failed to load exercise metadata for ${exerciseId}`, error);
          }
        }),
      );

      return cache;
    },
    [gql],
  );

  /**
   * Ensures every exercise in the provided programs exposes template metadata required by the UI.
   */
  const enrichProgramsWithMetadata = React.useCallback(
    async (programs: Program[]): Promise<Program[]> => {
      if (!programs.length) {
        return programs;
      }

      const referencedExerciseIds = new Set<string>();

      programs.forEach((program) => {
        program.sessions.forEach((session) => {
          session.exercises.forEach((exercise) => {
            const baseId = exercise.templateExerciseId ?? exercise.id;
            if (baseId) {
              referencedExerciseIds.add(baseId);
            }
          });
        });
      });

      await fetchMissingExerciseMetadata(Array.from(referencedExerciseIds));

      return programs.map((program) => ({
        ...program,
        sessions: program.sessions.map((session) => ({
          ...session,
          exercises: session.exercises.map(enrichExerciseWithMetadata),
        })),
      }));
    },
    [enrichExerciseWithMetadata, fetchMissingExerciseMetadata],
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      await execute(async () => {
        const trimmedQuery = q.trim();
        const { data, errors } = await gql.send<ProgramListPayload>({
          query: LIST_Q,
          operationName: 'ListPrograms',
          variables: {
            input: {
              page,
              limit,
              ...(trimmedQuery ? { q: trimmedQuery } : {}),
              ...(createdBy ? { createdBy } : {}),
              ...(userId ? { userId } : {}),
            },
          },
        });
        if (errors?.length) throw new Error(errors[0].message);

        const rawPrograms = data?.program_list.items ?? [];
        const enrichedPrograms = await enrichProgramsWithMetadata(rawPrograms);

        setItems(enrichedPrograms);
        setTotal(data?.program_list.total ?? 0);
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load programs';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [createdBy, enrichProgramsWithMetadata, execute, flashError, gql, limit, page, q, userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: {
      slug?: string;
      locale?: string;
      label: string;
      duration: number;
      frequency: number;
      description?: string;
      sessionIds?: string[];
      sessions?: ProgramSession[];
      userId?: string | null;
    }): Promise<Program> => {
      try {
        const locale = (input.locale ?? i18n.language)?.trim() || i18n.language;
        const slug = input.slug?.trim();

        const { data, errors } = await execute(() =>
          gql.send<CreateProgramPayload>({
            query: CREATE_M,
            operationName: 'CreateProgram',
            variables: {
              input: {
                ...input,
                slug: slug && slug.length ? slug : undefined,
                locale,
                sessionIds: input.sessionIds?.filter(Boolean),
                sessions: input.sessions?.map((session) => ({
                  ...session,
                  templateSessionId: session.templateSessionId || undefined,
                  slug: session.slug || undefined,
                  locale: session.locale || undefined,
                  description: session.description ?? undefined,
                  exercises: session.exercises.map((exercise) => ({
                    ...exercise,
                    templateExerciseId: exercise.templateExerciseId || undefined,
                    description: exercise.description ?? undefined,
                    instructions: exercise.instructions ?? undefined,
                    series: exercise.series ?? undefined,
                    repetitions: exercise.repetitions ?? undefined,
                    charge: exercise.charge ?? undefined,
                    restSeconds: exercise.restSeconds ?? undefined,
                    videoUrl: exercise.videoUrl ?? undefined,
                    level: exercise.level ?? undefined,
                  })),
                })),
              },
            },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        const createdProgram = data?.program_create;
        if (!createdProgram) {
          throw new Error(
            t('programs-coatch.notifications.program_create_failed'),
          );
        }
        flashSuccess(
          t('programs-coatch.notifications.program_created'),
        );
        await load();
        const [enrichedProgram] = await execute(() =>
          enrichProgramsWithMetadata([createdProgram]),
        );
        return enrichedProgram;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Create failed';
        flashError(message);
        throw error;
      }
    },
    [
      enrichProgramsWithMetadata,
      execute,
      flashError,
      flashSuccess,
      gql,
      i18n.language,
      load,
      t,
    ],
  );

  const update = React.useCallback(
    async (input: {
      id: string;
      slug?: string;
      locale?: string;
      label?: string;
      duration?: number;
      frequency?: number;
      description?: string | null;
      sessionIds?: string[];
      sessions?: ProgramSession[];
      userId?: string | null;
    }) => {
      try {
        const locale = (input.locale ?? i18n.language)?.trim() || i18n.language;
        const slug = input.slug?.trim();

        const { errors } = await execute(() =>
          gql.send<UpdateProgramPayload>({
            query: UPDATE_M,
            operationName: 'UpdateProgram',
            variables: {
              input: {
                ...input,
                slug: slug && slug.length ? slug : undefined,
                locale,
                description: input.description ?? undefined,
                sessionIds: input.sessionIds?.filter(Boolean),
                sessions: input.sessions?.map((session) => ({
                  ...session,
                  templateSessionId: session.templateSessionId || undefined,
                  slug: session.slug || undefined,
                  locale: session.locale || undefined,
                  description: session.description ?? undefined,
                  exercises: session.exercises.map((exercise) => ({
                    ...exercise,
                    templateExerciseId: exercise.templateExerciseId || undefined,
                    description: exercise.description ?? undefined,
                    instructions: exercise.instructions ?? undefined,
                    series: exercise.series ?? undefined,
                    repetitions: exercise.repetitions ?? undefined,
                    charge: exercise.charge ?? undefined,
                    restSeconds: exercise.restSeconds ?? undefined,
                    videoUrl: exercise.videoUrl ?? undefined,
                    level: exercise.level ?? undefined,
                  })),
                })),
              },
            },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess(t('programs-coatch.notifications.program_updated'));
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Update failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, i18n.language, load, t]
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<DeleteProgramPayload>({
            query: DELETE_M,
            operationName: 'SoftDeleteProgram',
            variables: { id },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        if (!data?.program_softDelete) {
          throw new Error(
            t('programs-coatch.notifications.program_delete_failed'),
          );
        }
        flashSuccess(
          t('programs-coatch.notifications.program_deleted'),
        );
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Delete failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t]
  );

  return { items, total, loading, create, update, remove, reload: load };
}
