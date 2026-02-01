// src/hooks/useNotes.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface Note {
  id: string;
  label: string;
  description: string;
  athleteId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteListResult {
  items: Note[];
  total: number;
  page: number;
  limit: number;
}

type NoteListPayload = { note_list: NoteListResult };
type NoteCreatePayload = { note_create: Note | null };
type NoteUpdatePayload = { note_update: Note | null };
type NoteDeletePayload = { note_delete: boolean };

const NOTE_FIELDS = `
  id
  label
  description
  athleteId
  createdBy
  createdAt
  updatedAt
`;

const LIST_QUERY = `
  query ListNotes($input: ListNotesInput) {
    note_list(input: $input) {
      items {
        ${NOTE_FIELDS}
      }
      total
      page
      limit
    }
  }
`;

const CREATE_MUTATION = `
  mutation CreateNote($input: CreateNoteInput!) {
    note_create(input: $input) {
      ${NOTE_FIELDS}
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateNote($input: UpdateNoteInput!) {
    note_update(input: $input) {
      ${NOTE_FIELDS}
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteNote($id: ID!) {
    note_delete(id: $id)
  }
`;

export interface UseNotesParams {
  page: number;
  limit: number;
  athleteId?: string | null;
  enabled?: boolean;
}

export interface NoteCreateInput {
  label: string;
  description: string;
  athleteId?: string | null;
}

export interface NoteUpdateInput {
  id: string;
  label?: string;
  description?: string;
  athleteId?: string | null;
}

function buildListInput({ page, limit, athleteId }: UseNotesParams) {
  return {
    page,
    limit,
    athleteId,
  };
}

export function useNotes(params: UseNotesParams) {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
  const [items, setItems] = React.useState<Note[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const isEnabled = params.enabled ?? true;

  const load = React.useCallback(async () => {
    if (!isEnabled) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<NoteListPayload>({
          query: LIST_QUERY,
          operationName: 'ListNotes',
          variables: { input: buildListInput(params) },
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.note_list.items ?? []);
      setTotal(data?.note_list.total ?? 0);
    } catch (_error: unknown) {
      flashError(t('dashboard.tasksNotes.notes.notifications.load_failure'));
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, isEnabled, params, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback(
    async (input: NoteCreateInput) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<NoteCreatePayload>({
            query: CREATE_MUTATION,
            operationName: 'CreateNote',
            variables: { input },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        const created = data?.note_create;
        if (!created) throw new Error('CreateNote returned no data');
        flashSuccess(t('dashboard.tasksNotes.notes.notifications.create_success'));
        await load();
        return created;
      } catch (error: unknown) {
        flashError(t('dashboard.tasksNotes.notes.notifications.create_failure'));
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
  );

  const update = React.useCallback(
    async (input: NoteUpdateInput) => {
      try {
        const { errors } = await execute(() =>
          gql.send<NoteUpdatePayload>({
            query: UPDATE_MUTATION,
            operationName: 'UpdateNote',
            variables: { input },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess(t('dashboard.tasksNotes.notes.notifications.update_success'));
        await load();
      } catch (error: unknown) {
        flashError(t('dashboard.tasksNotes.notes.notifications.update_failure'));
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<NoteDeletePayload>({
            query: DELETE_MUTATION,
            operationName: 'DeleteNote',
            variables: { id },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess(t('dashboard.tasksNotes.notes.notifications.delete_success'));
        await load();
      } catch (error: unknown) {
        flashError(t('dashboard.tasksNotes.notes.notifications.delete_failure'));
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
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
