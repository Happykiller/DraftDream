import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface NoteUser {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface Note {
  id: string;
  label: string;
  description: string;
  athleteId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: NoteUser | null;
  athlete?: NoteUser | null;
}

interface NoteListResult {
  items: Note[];
  total: number;
  page: number;
  limit: number;
}

type NoteListPayload = { note_list: NoteListResult };

const NOTE_FIELDS = `
  id
  label
  description
  athleteId
  createdBy
  createdAt
  updatedAt
  creator { id first_name last_name email }
  athlete { id first_name last_name email }
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

export interface UseNotesParams {
  page: number;
  limit: number;
  athleteId?: string | null;
  createdBy?: string;
}

function buildListInput({ page, limit, athleteId, createdBy }: UseNotesParams) {
  return {
    page,
    limit,
    athleteId,
    createdBy,
  };
}

/** Load notes for backoffice views with server pagination. */
export function useNotes({ page, limit, athleteId, createdBy }: UseNotesParams) {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
  const [items, setItems] = React.useState<Note[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const isLoadingRef = React.useRef(false);

  const input = React.useMemo(
    () => buildListInput({ page, limit, athleteId, createdBy }),
    [athleteId, createdBy, limit, page],
  );

  const load = React.useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<NoteListPayload>({
          query: LIST_QUERY,
          operationName: 'ListNotes',
          variables: { input },
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.note_list.items ?? []);
      setTotal(data?.note_list.total ?? 0);
    } catch (error) {
      flashError(t('notes.notifications.load_failure'));
      throw error;
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [execute, flashError, gql, input, t]);

  const lastSigRef = React.useRef<string | null>(null);
  const sig = `${page}|${limit}|${athleteId ?? ''}|${createdBy ?? ''}`;

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
