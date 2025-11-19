// src/hooks/nutrition/useMealDays.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import type { MealCreator, MealVisibility } from './useMeals';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type MealDayVisibility = 'PRIVATE' | 'PUBLIC';

export interface MealDayMealSnapshot {
  id: string;
  slug: string;
  label: string;
  locale: string;
  visibility: MealVisibility;
  foods?: string | null;
  calories?: number | null;
  proteinGrams?: number | null;
  carbGrams?: number | null;
  fatGrams?: number | null;
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

export interface UseMealDaysParams {
  page: number; // 1-based
  limit: number;
  q: string;
  locale: string;
  visibility?: MealDayVisibility;
}

export interface UseMealDaysResult {
  items: MealDay[];
  total: number;
  loading: boolean;
  create: (input: {
    slug: string;
    locale: string;
    label: string;
    description?: string;
    mealIds: string[];
    visibility: MealDayVisibility;
  }) => Promise<void>;
  update: (input: {
    id: string;
    slug?: string;
    locale?: string;
    label?: string;
    description?: string;
    mealIds?: string[];
    visibility?: MealDayVisibility;
  }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Provides list and mutation helpers for meal day templates consumed by nutrition plans.
 */
export function useMealDays({
  page,
  limit,
  q,
  locale,
  visibility,
}: UseMealDaysParams): UseMealDaysResult {
  const { t } = useTranslation();
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
      const normalizedLocale = locale.trim();
      const filters = {
        page,
        limit,
        q: q.trim() || undefined,
        locale: normalizedLocale || undefined,
        visibility: visibility || undefined,
      };
      const { data, errors } = await execute(() =>
        gql.send<MealDayListPayload>({
          query: LIST_QUERY,
          variables: { input: filters },
          operationName: 'ListMealDays',
        }),
      );
      if (errors?.length) {
        throw new Error(errors[0].message);
      }
      setItems(data?.mealDay_list.items ?? []);
      setTotal(data?.mealDay_list.total ?? 0);
    } catch (caught: unknown) {
      const message =
        caught instanceof Error
          ? caught.message
          : t('nutrition-plans.errors.load_meal_days_failed');
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, locale, page, q, t, visibility]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback<UseMealDaysResult['create']>(
    async (input) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateMealDayPayload>({
            query: CREATE_MUTATION,
            variables: { input },
            operationName: 'CreateMealDay',
          }),
        );
        if (errors?.length) {
          throw new Error(errors[0].message);
        }
        flashSuccess(t('nutrition-plans.notifications.meal_day_created'));
        await load();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.meal_day_create_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
  );

  const update = React.useCallback<UseMealDaysResult['update']>(
    async (input) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateMealDayPayload>({
            query: UPDATE_MUTATION,
            variables: { input },
            operationName: 'UpdateMealDay',
          }),
        );
        if (errors?.length) {
          throw new Error(errors[0].message);
        }
        flashSuccess(t('nutrition-plans.notifications.meal_day_updated'));
        await load();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.meal_day_update_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
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
        if (errors?.length) {
          throw new Error(errors[0].message);
        }
        flashSuccess(t('nutrition-plans.notifications.meal_day_deleted'));
        await load();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.meal_day_delete_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
  );

  return { items, total, loading, create, update, remove, reload: load };
}
