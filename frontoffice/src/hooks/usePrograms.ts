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

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<ProgramListPayload>({
          query: LIST_Q,
          operationName: 'ListPrograms',
          variables: {
            input: {
              page,
              limit,
              q: q || undefined,
              createdBy: createdBy || undefined,
              userId: userId || undefined,
            },
          },
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.program_list.items ?? []);
      setTotal(data?.program_list.total ?? 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load programs';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [createdBy, execute, flashError, gql, limit, page, q, userId]);

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
            t('programs-coatch.notifications.program_create_failed', {
              defaultValue: 'Unable to create the program.',
            }),
          );
        }
        flashSuccess(
          t('programs-coatch.notifications.program_created', {
            defaultValue: 'Program created',
          }),
        );
        await load();
        return createdProgram;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Create failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, i18n.language, load, t]
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
        flashSuccess(
          t('programs-coatch.notifications.program_updated', {
            defaultValue: 'Program updated',
          }),
        );
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
            t('programs-coatch.notifications.program_delete_failed', {
              defaultValue: 'Failed to delete program',
            }),
          );
        }
        flashSuccess(
          t('programs-coatch.notifications.program_deleted', {
            defaultValue: 'Program deleted',
          }),
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
