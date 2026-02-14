// src/hooks/useMealDays.ts
// Comment in English: Manage CRUD operations for meal day templates (ordered collections of meals).
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import type { MealCreator, MealVisibility } from '@hooks/useMeals';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

import type { Visibility } from '@src/commons/visibility';

export type MealDayVisibility = Visibility;

export interface MealDayMealSnapshot {
  id: string;
  slug: string;
  label: string;
  locale: string;
  visibility: MealVisibility;
  foods?: string;
  calories?: number;
  proteinGrams?: number;
  carbGrams?: number;
  fatGrams?: number;
  type?: {
    id?: string | null;
    slug?: string | null;
    label: string;
    locale?: string | null;
    visibility?: MealVisibility | null;
    icon?: string | null;
  } | null;
}

export interface MealDay {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string | null;
  mealIds: string[];
  visibility: MealDayVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: MealCreator | null;
  meals?: MealDayMealSnapshot[] | null;
}

interface MealDayListPayload {
  mealDay_list: {
    items: MealDay[];
    total: number;
    page: number;
    limit: number;
  };
}

interface CreateMealDayPayload {
  mealDay_create: MealDay;
}

interface UpdateMealDayPayload {
  mealDay_update: MealDay;
}

interface DeleteMealDayPayload {
  mealDay_delete: boolean;
}

interface GetMealDayPayload {
  mealDay_get: MealDay | null;
}

const LIST_QUERY = `
  query ListMealDays($input: ListMealDaysInput) {
    mealDay_list(input: $input) {
      items {
        id
        slug
        locale
        label
        description
        mealIds
        meals {
          id
          slug
          label
          locale
          visibility
          foods
          calories
          proteinGrams
          carbGrams
          fatGrams
          type { id slug label locale visibility icon }
        }
        visibility
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

const CREATE_MUTATION = `
  mutation CreateMealDay($input: CreateMealDayInput!) {
    mealDay_create(input: $input) {
      id
      slug
      locale
      label
      description
      mealIds
      meals {
        id
        slug
        label
        locale
        visibility
        foods
        calories
        proteinGrams
        carbGrams
        fatGrams
        type { id slug label locale visibility icon }
      }
      visibility
      createdBy
      createdAt
      updatedAt
      creator { id email }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateMealDay($input: UpdateMealDayInput!) {
    mealDay_update(input: $input) {
      id
      slug
      locale
      label
      description
      mealIds
      meals {
        id
        slug
        label
        locale
        visibility
        foods
        calories
        proteinGrams
        carbGrams
        fatGrams
        type { id slug label locale visibility icon }
      }
      visibility
      createdBy
      createdAt
      updatedAt
      creator { id email }
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteMealDay($id: ID!) {
    mealDay_delete(id: $id)
  }
`;

const GET_QUERY = `
  query GetMealDay($id: ID!) {
    mealDay_get(id: $id) {
      id
      slug
      locale
      label
      description
      mealIds
      meals {
        id
        slug
        label
        locale
        visibility
        foods
        calories
        proteinGrams
        carbGrams
        fatGrams
        type { id slug label locale visibility icon }
      }
      visibility
      createdBy
      createdAt
      updatedAt
      creator { id email }
    }
  }
`;

export interface UseMealDaysParams {
  page: number; // 1-based
  limit: number;
  q: string;
  locale?: string;
  visibility?: MealDayVisibility;
}

export interface UseMealDaysResult {
  items: MealDay[];
  total: number;
  loading: boolean;
  create: (input: {
    locale: string;
    label: string;
    description?: string;
    mealIds: string[];
    visibility: MealDayVisibility;
  }) => Promise<void>;
  update: (input: {
    id: string;
    locale?: string;
    label?: string;
    description?: string;
    mealIds?: string[];
    visibility?: MealDayVisibility;
  }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reload: () => Promise<void>;
  getMealDay: (id: string) => Promise<MealDay | null>;
}

export function useMealDays({ page, limit, q, locale, visibility }: UseMealDaysParams): UseMealDaysResult {
  const [items, setItems] = React.useState<MealDay[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);

  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        limit,
        q: q || undefined,
        locale: locale || undefined,
        visibility: visibility || undefined,
      };
      const { data, errors } = await execute(() =>
        gql.send<MealDayListPayload>({
          query: LIST_QUERY,
          variables: { input: filters },
          operationName: 'ListMealDays',
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.mealDay_list.items ?? []);
      setTotal(data?.mealDay_list.total ?? 0);
    } catch (error: any) {
      flashError(error?.message ?? 'Failed to load meal days');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, locale, page, q, visibility]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback<UseMealDaysResult['create']>(
    async (input) => {
      try {
        const sanitizedInput = { ...input };
        delete (sanitizedInput as any).slug; // Slug is generated server-side.
        const { errors } = await execute(() =>
          gql.send<CreateMealDayPayload>({
            query: CREATE_MUTATION,
            variables: { input: sanitizedInput },
            operationName: 'CreateMealDay',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal day created');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Create failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const update = React.useCallback<UseMealDaysResult['update']>(
    async (input) => {
      try {
        const sanitizedInput = { ...input };
        delete (sanitizedInput as any).slug; // Slug is generated server-side.
        const { errors } = await execute(() =>
          gql.send<UpdateMealDayPayload>({
            query: UPDATE_MUTATION,
            variables: { input: sanitizedInput },
            operationName: 'UpdateMealDay',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal day updated');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Update failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const remove = React.useCallback<UseMealDaysResult['remove']>(
    async (id) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeleteMealDayPayload>({
            query: DELETE_MUTATION,
            variables: { id },
            operationName: 'DeleteMealDay',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal day deleted');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Delete failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );



  const getMealDay = React.useCallback<UseMealDaysResult['getMealDay']>(
    async (id) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<GetMealDayPayload>({
            query: GET_QUERY,
            variables: { id },
            operationName: 'GetMealDay',
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        return data?.mealDay_get ?? null;
      } catch (error: any) {
        flashError(error?.message ?? 'Failed to load meal day');
        return null;
      }
    },
    [execute, flashError, gql],
  );

  return { items, total, loading, create, update, remove, reload: load, getMealDay };
}
