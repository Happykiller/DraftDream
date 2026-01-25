// src/hooks/useTasks.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type TaskPriority = 'LOW' | 'MIDDLE' | 'HIGH';
export type TaskStatus = 'TODO' | 'DONE';

export interface Task {
  id: string;
  label: string;
  priority: TaskPriority;
  status: TaskStatus;
  day: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskListResult {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}

type TaskListPayload = { task_list: TaskListResult };
type TaskCreatePayload = { task_create: Task | null };
type TaskUpdatePayload = { task_update: Task | null };
type TaskDeletePayload = { task_delete: boolean };

const TASK_FIELDS = `
  id
  label
  priority
  status
  day
  createdBy
  createdAt
  updatedAt
`;

const LIST_QUERY = `
  query ListTasks($input: ListTasksInput) {
    task_list(input: $input) {
      items {
        ${TASK_FIELDS}
      }
      total
      page
      limit
    }
  }
`;

const CREATE_MUTATION = `
  mutation CreateTask($input: CreateTaskInput!) {
    task_create(input: $input) {
      ${TASK_FIELDS}
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateTask($input: UpdateTaskInput!) {
    task_update(input: $input) {
      ${TASK_FIELDS}
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteTask($id: ID!) {
    task_delete(id: $id)
  }
`;

export interface UseTasksParams {
  page: number;
  limit: number;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface TaskCreateInput {
  label: string;
  priority: TaskPriority;
  status: TaskStatus;
  day: string;
}

export interface TaskUpdateInput {
  id: string;
  label?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  day?: string;
}

function buildListInput({ page, limit, status, priority }: UseTasksParams) {
  return {
    page,
    limit,
    status,
    priority,
  };
}

export function useTasks(params: UseTasksParams) {
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
  const [items, setItems] = React.useState<Task[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<TaskListPayload>({
          query: LIST_QUERY,
          operationName: 'ListTasks',
          variables: { input: buildListInput(params) },
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.task_list.items ?? []);
      setTotal(data?.task_list.total ?? 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load tasks';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, params]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: TaskCreateInput) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<TaskCreatePayload>({
            query: CREATE_MUTATION,
            operationName: 'CreateTask',
            variables: { input },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        const created = data?.task_create;
        if (!created) throw new Error('CreateTask returned no data');
        flashSuccess('Task created');
        await load();
        return created;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Create failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const update = React.useCallback(
    async (input: TaskUpdateInput) => {
      try {
        const { errors } = await execute(() =>
          gql.send<TaskUpdatePayload>({
            query: UPDATE_MUTATION,
            operationName: 'UpdateTask',
            variables: { input },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Task updated');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Update failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<TaskDeletePayload>({
            query: DELETE_MUTATION,
            operationName: 'DeleteTask',
            variables: { id },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Task deleted');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Delete failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  return {
    items,
    total,
    loading,
    create,
    update,
    remove,
    reload: load,
  };
}
