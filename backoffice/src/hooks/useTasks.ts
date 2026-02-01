import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type TaskPriority = 'LOW' | 'MIDDLE' | 'HIGH';
export type TaskStatus = 'TODO' | 'DONE';

export type TaskCreator = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

export interface Task {
  id: string;
  label: string;
  priority: TaskPriority;
  status: TaskStatus;
  day: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: TaskCreator | null;
}

interface TaskListResult {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}

type TaskListPayload = { task_list: TaskListResult };

const TASK_FIELDS = `
  id
  label
  priority
  status
  day
  createdBy
  createdAt
  updatedAt
  creator { id first_name last_name email }
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

export interface UseTasksParams {
  page: number;
  limit: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  createdBy?: string;
}

function buildListInput({ page, limit, status, priority, createdBy }: UseTasksParams) {
  return {
    page,
    limit,
    status,
    priority,
    createdBy,
  };
}

/** Load tasks for moderation views with server pagination. */
export function useTasks({ page, limit, status, priority, createdBy }: UseTasksParams) {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
  const [items, setItems] = React.useState<Task[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const isLoadingRef = React.useRef(false);

  const input = React.useMemo(
    () => buildListInput({ page, limit, status, priority, createdBy }),
    [createdBy, limit, page, priority, status],
  );

  const load = React.useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<TaskListPayload>({
          query: LIST_QUERY,
          operationName: 'ListTasks',
          variables: { input },
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.task_list.items ?? []);
      setTotal(data?.task_list.total ?? 0);
    } catch (error) {
      console.error('[useTasks] Failed to load tasks', error);
      flashError(t('tasks.notifications.load_failure'));
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [execute, flashError, gql, input, t]);

  const lastSigRef = React.useRef<string | null>(null);
  const sig = `${page}|${limit}|${status ?? ''}|${priority ?? ''}|${createdBy ?? ''}`;

  React.useEffect(() => {
    if (lastSigRef.current === sig) {
      return;
    }
    lastSigRef.current = sig;
    void load();
  }, [load, sig]);

  return {
    items,
    total,
    loading,
    reload: load,
  };
}
