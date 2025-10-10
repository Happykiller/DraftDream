// src/hooks/useEquipment.ts
import * as React from 'react';
import inversify from '@src/commons/inversify';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type EquipmentVisibility = 'PRIVATE' | 'PUBLIC';
export interface Creator { id: string; email: string; }

export interface Equipment {
  id: string;
  slug: string;
  locale: string;
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
      items { id slug locale visibility creator { id email } createdAt updatedAt }
      total page limit
    }
  }
`;

const CREATE_M = `
  mutation CreateEquipment($input: CreateEquipmentInput!) {
    equipment_create(input: $input) {
      id slug locale visibility creator { id email } createdAt updatedAt
    }
  }
`;

const UPDATE_M = `
  mutation UpdateEquipment($input: UpdateEquipmentInput!) {
    equipment_update(input: $input) {
      id slug locale visibility creator { id email } createdAt updatedAt
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
  const flash = useFlashStore();
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await gql.send<EquipmentListPayload>({
        query: LIST_Q,
        variables: { input: { page, limit, q: q || undefined } },
        operationName: 'ListEquipment',
      });
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.equipment_list.items ?? []);
      setTotal(data?.equipment_list.total ?? 0);
    } catch (e: any) {
      flash.error(e?.message ?? 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, gql, flash]);

  React.useEffect(() => { void load(); }, [load]);

  const create = React.useCallback(
    async (input: { slug: string; locale: string; visibility: EquipmentVisibility }) => {
      try {
        const { errors } = await gql.send<CreatePayload>({
          query: CREATE_M,
          variables: { input },
          operationName: 'CreateEquipment',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Equipment created');
        await load();
      } catch (e: any) {
        flash.error(e?.message ?? 'Create failed');
        throw e;
      }
    },
    [gql, flash, load]
  );

  const update = React.useCallback(
    async (input: { id: string; slug?: string; locale?: string }) => {
      try {
        const { errors } = await gql.send<UpdatePayload>({
          query: UPDATE_M,
          variables: { input },
          operationName: 'UpdateEquipment',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Equipment updated');
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
        const { errors } = await gql.send<DeletePayload>({
          query: DELETE_M,
          variables: { id },
          operationName: 'DeleteEquipment',
        });
        if (errors?.length) throw new Error(errors[0].message);
        flash.success('Equipment deleted');
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
