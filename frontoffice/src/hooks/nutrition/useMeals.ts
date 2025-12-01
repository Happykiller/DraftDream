// src/hooks/nutrition/useMeals.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export type MealVisibility = 'PRIVATE' | 'PUBLIC';

export interface MealTypeSummary {
  id: string;
  label: string;
  locale: string;

  visibility?: string | null;
  icon?: string | null;
}

export interface MealCreator {
  id: string;
  email: string;
}

export interface Meal {
  id: string;

  locale: string;
  label: string;
  typeId: string;
  type?: MealTypeSummary | null;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  visibility: MealVisibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: MealCreator | null;
}

type MealListPayload = {
  meal_list: {
    items: Meal[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateMealPayload = { meal_create: Meal };
type UpdateMealPayload = { meal_update: Meal };
type DeleteMealPayload = { meal_delete: boolean };

const LIST_QUERY = `
  query ListMeals($input: ListMealsInput) {
    meal_list(input: $input) {
      items {
        id

        locale
        label
        typeId
        type { id label locale visibility icon }
        foods
        calories
        proteinGrams
        carbGrams
        fatGrams
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
  mutation CreateMeal($input: CreateMealInput!) {
    meal_create(input: $input) {
      id

      locale
      label
      typeId
      type { id label locale visibility icon }
      foods
      calories
      proteinGrams
      carbGrams
      fatGrams
      visibility
      createdBy
      createdAt
      updatedAt
      creator { id email }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateMeal($input: UpdateMealInput!) {
    meal_update(input: $input) {
      id

      locale
      label
      typeId
      type { id label locale visibility icon }
      foods
      calories
      proteinGrams
      carbGrams
      fatGrams
      visibility
      createdBy
      createdAt
      updatedAt
      creator { id email }
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteMeal($id: ID!) {
    meal_delete(id: $id)
  }
`;

export interface UseMealsParams {
  page: number; // 1-based
  limit: number;
  q: string;
  locale: string;
  typeId?: string;
  visibility?: MealVisibility;
}

export interface UseMealsResult {
  items: Meal[];
  total: number;
  loading: boolean;
  create: (input: {

    label: string;
    locale: string;
    typeId: string;
    foods: string;
    calories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    visibility: MealVisibility;
  }) => Promise<void>;
  update: (input: {
    id: string;

    label?: string;
    locale?: string;
    typeId?: string;
    foods?: string;
    calories?: number;
    proteinGrams?: number;
    carbGrams?: number;
    fatGrams?: number;
    visibility?: MealVisibility;
  }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Lists meals with pagination helpers and wraps CRUD mutations with flash feedback.
 */
export function useMeals({
  page,
  limit,
  q,
  locale,
  typeId,
  visibility,
}: UseMealsParams): UseMealsResult {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<Meal[]>([]);
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
        typeId: typeId || undefined,
        visibility: visibility || undefined,
      };
      const { data, errors } = await execute(() =>
        gql.send<MealListPayload>({
          query: LIST_QUERY,
          variables: { input: filters },
          operationName: 'ListMeals',
        }),
      );
      if (errors?.length) {
        throw new Error(errors[0].message);
      }
      setItems(data?.meal_list.items ?? []);
      setTotal(data?.meal_list.total ?? 0);
    } catch (caught: unknown) {
      const message =
        caught instanceof Error
          ? caught.message
          : t('nutrition-plans.errors.load_meals_failed');
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, locale, page, q, t, typeId, visibility]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback<UseMealsResult['create']>(
    async (input) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateMealPayload>({
            query: CREATE_MUTATION,
            variables: { input },
            operationName: 'CreateMeal',
          }),
        );
        if (errors?.length) {
          throw new Error(errors[0].message);
        }
        flashSuccess(t('nutrition-plans.notifications.meal_created'));
        await load();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.meal_create_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
  );

  const update = React.useCallback<UseMealsResult['update']>(
    async (input) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateMealPayload>({
            query: UPDATE_MUTATION,
            variables: { input },
            operationName: 'UpdateMeal',
          }),
        );
        if (errors?.length) {
          throw new Error(errors[0].message);
        }
        flashSuccess(t('nutrition-plans.notifications.meal_updated'));
        await load();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.meal_update_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
  );

  const remove = React.useCallback<UseMealsResult['remove']>(
    async (id) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeleteMealPayload>({
            query: DELETE_MUTATION,
            variables: { id },
            operationName: 'DeleteMeal',
          }),
        );
        if (errors?.length) {
          throw new Error(errors[0].message);
        }
        flashSuccess(t('nutrition-plans.notifications.meal_deleted'));
        await load();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.meal_delete_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
  );

  return { items, total, loading, create, update, remove, reload: load };
}
