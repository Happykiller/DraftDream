// src/hooks/usePrograms.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface ProgramCreator {
  id: string;
  email: string;
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
  creator?: ProgramCreator | null;
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
type DeleteProgramPayload = { program_delete: boolean };

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
        creator { id email }
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
      creator { id email }
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
      creator { id email }
    }
  }
`;

const DELETE_M = `
  mutation DeleteProgram($id: ID!) {
    program_delete(id: $id)
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
  const flash = useFlashStore();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await gql.send<ProgramListPayload>({
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
      });
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.program_list.items ?? []);
      setTotal(data?.program_list.total ?? 0);
    } catch (e: any) {
      flash.error(e?.message ?? 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, createdBy, userId, gql, flash]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: {
      slug: string;
      locale: string;
      label: string;
      duration: number;
      frequency: number;
      description?: string;
      sessionIds?: string[];
      sessions?: ProgramSession[];
      userId?: string | null;
    }) => {
      try {
        const { errors } = await gql.send<CreateProgramPayload>({
          query: CREATE_M,
          operationName: 'CreateProgram',
          variables: {
            input: {
              ...input,
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
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Program created');
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
        const { errors } = await gql.send<UpdateProgramPayload>({
          query: UPDATE_M,
          operationName: 'UpdateProgram',
          variables: {
            input: {
              ...input,
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
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Program updated');
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
        const { errors } = await gql.send<DeleteProgramPayload>({
          query: DELETE_M,
          operationName: 'DeleteProgram',
          variables: { id },
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Program deleted');
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
