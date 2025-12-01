// src/hooks/useEquipment.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type EquipmentVisibility = 'PRIVATE' | 'PUBLIC';
export interface Creator { id: string; email: string; }

export interface Equipment {
  id: string;

  locale: string;
  label: string;
  visibility: EquipmentVisibility;
  creator: Creator;          // 👈 include creator
  createdAt: string;
  updatedAt: string;
}

type EquipmentListPayload = {
  equipment_list: {
    items: Equipment[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreatePayload = { equipment_create: Equipment };
type UpdatePayload = { equipment_update: Equipment };
type DeletePayload = { equipment_delete: boolean };

const LIST_Q = `
  query ListEquipment($input: ListEquipmentInput) {
    equipment_list(input: $input) {
      items { id locale label visibility creator { id email } createdAt updatedAt }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateEquipment($input: CreateEquipmentInput!) {
    equipment_create(input: $input) {
      id locale label visibility creator { id email } createdAt updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateEquipment($input: UpdateEquipmentInput!) {
    equipment_update(input: $input) {
      id locale label visibility creator { id email } createdAt updatedAt
    }
  }
`;

const DELETE_M = `
  mutation DeleteEquipment($id: ID!) {
    equipment_delete(id: $id)
  }
`;

export interface UseEquipmentParams {
  page: number;  // 1-based
  limit: number;
  q: string;
}

export function useEquipment({ page, limit, q }: UseEquipmentParams) {
  const [items, setItems] = React.useState<Equipment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<EquipmentListPayload>({
          query: LIST_Q,
          variables: { input: { page, limit, q: q || undefined } },
          operationName: 'ListEquipment',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.equipment_list.items ?? []);
      setTotal(data?.equipment_list.total ?? 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load equipment';
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: {

      locale: string;
      label: string;
      visibility: EquipmentVisibility;
    }) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<CreatePayload>({
            query: CREATE_M,
            variables: { input },
            operationName: 'CreateEquipment',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        const created = data?.equipment_create;
        if (!created) throw new Error('CreateEquipment returned no data');
        flashSuccess('Equipment created');
        await load();
        return created;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Create failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load]
  );

  const update = React.useCallback(
    async (input: {
      id: string;

      locale?: string;
      label?: string;
      visibility?: EquipmentVisibility;
    }) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdatePayload>({
            query: UPDATE_M,
            variables: { input },
            operationName: 'UpdateEquipment',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Equipment updated');
        await load();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Update failed';
        flashError(message);
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load]
  );

  const remove = React.useCallback(
    async (id: string) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeletePayload>({
            query: DELETE_M,
            variables: { id },
            operationName: 'DeleteEquipment',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Equipment deleted');
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
