// src/hooks/useProgramRecords.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type ProgramRecordState = 'CREATE' | 'DRAFT' | 'FINISH';

export interface ProgramRecord {
  id: string;
  userId: string;
  programId: string;
  sessionId: string;
  comment?: string | null;
  satisfactionRating?: number | null;
  state: ProgramRecordState;
  createdAt: string;
  updatedAt: string;
}

type ProgramRecordListPayload = {
  programRecord_list: {
    items: ProgramRecord[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateProgramRecordPayload = { programRecord_create: ProgramRecord | null };
type UpdateProgramRecordPayload = { programRecord_updateState: ProgramRecord | null };

const LIST_Q = `
  query ListProgramRecords($input: ListProgramRecordsInput) {
    programRecord_list(input: $input) {
      items {
        id
        userId
        programId
        sessionId
        comment
        satisfactionRating
        state
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;

const CREATE_M = `
  mutation CreateProgramRecord($input: CreateProgramRecordInput!) {
    programRecord_create(input: $input) {
      id
      userId
      programId
      sessionId
      comment
      satisfactionRating
      state
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateProgramRecord($input: UpdateProgramRecordInput!) {
    programRecord_updateState(input: $input) {
      id
      userId
      programId
      state
      comment
      satisfactionRating
      createdAt
      updatedAt
    }
  }
`;

const DELETE_M = `
  mutation DeleteProgramRecord($id: ID!) {
    programRecord_delete(id: $id)
  }
`;

const HARD_DELETE_M = `
  mutation HardDeleteProgramRecord($id: ID!) {
    programRecord_hardDelete(id: $id)
  }
`;

export interface UseProgramRecordsParams {
  page: number; // 1-based
  limit: number;
  userId?: string;
  programId?: string;
  state?: ProgramRecordState;
}

export function useProgramRecords({ page, limit, userId, programId, state }: UseProgramRecordsParams) {
  const [items, setItems] = React.useState<ProgramRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((store) => store.error);
  const flashSuccess = useFlashStore((store) => store.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<ProgramRecordListPayload>({
          query: LIST_Q,
          variables: {
            input: {
              page,
              limit,
              userId: userId || undefined,
              programId: programId || undefined,
              state: state || undefined,
            },
          },
          operationName: 'ListProgramRecords',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.programRecord_list.items ?? []);
      setTotal(data?.programRecord_list.total ?? 0);
    } catch (e: any) {
      flashError(e?.message ?? 'Failed to load program records');
    } finally {
      setLoading(false);
    }
  }, [execute, gql, page, limit, userId, programId, state, flashError]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: {
      userId: string;
      programId: string;
      sessionId: string;
      comment?: string;
      satisfactionRating?: number;
      state?: ProgramRecordState;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateProgramRecordPayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateProgramRecord',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Program record created');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load]
  );

  const update = React.useCallback(
    async (input: { id: string; state: ProgramRecordState; comment?: string; satisfactionRating?: number }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateProgramRecordPayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateProgramRecord',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Program record updated');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Update failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load]
  );

  const deleteRecord = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<{ programRecord_delete: boolean }>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteProgramRecord',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Program record deleted');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Delete failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load]
  );

  const hardDeleteRecord = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<{ programRecord_hardDelete: boolean }>({
            query: HARD_DELETE_M,
            variables: { id },
            operationName: 'HardDeleteProgramRecord',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Program record hard deleted');
        await load();
      } catch (e: any) {
        flashError(e?.message ?? 'Hard delete failed');
        throw e;
      }
    },
    [execute, gql, flashError, flashSuccess, load]
  );

  return { items, total, loading, create, update, deleteRecord, hardDeleteRecord, reload: load };
}
