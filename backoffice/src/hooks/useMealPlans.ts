// src/hooks/useMealPlans.ts
// Comment in English: Handle CRUD operations for nutrition meal plans including aggregated days and meals.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

import type { Visibility } from '@src/commons/visibility';

export type MealPlanVisibility = Visibility;

export interface MealPlanUserSummary {
  id: string;
  email: string;
}

export interface MealPlanMealTypeSnapshot {
  id?: string | null;
  templateMealTypeId?: string | null;
  slug?: string | null;
  locale?: string | null;
  label: string;
  visibility?: string | null;
}

export interface MealPlanMealSnapshot {
  id?: string;
  templateMealId?: string | null;
  slug?: string | null;
  locale?: string | null;
  label: string;
  description?: string | null;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  type: MealPlanMealTypeSnapshot;
}

export interface MealPlanDaySnapshot {
  id?: string;
  templateMealDayId?: string | null;
  slug?: string | null;
  locale?: string | null;
  label: string;
  description?: string | null;
  meals: MealPlanMealSnapshot[];
}

export interface MealPlan {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string | null;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDaySnapshot[];
  userId?: string | null;
  athlete?: MealPlanUserSummary | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: MealPlanUserSummary | null;
  visibility: MealPlanVisibility;
}

type MealPlanListPayload = {
  mealPlan_list: {
    items: MealPlan[];
    total: number;
    page: number;
    limit: number;
  };
};

type CreateMealPlanPayload = { mealPlan_create: MealPlan | null };
type UpdateMealPlanPayload = { mealPlan_update: MealPlan | null };
type DeleteMealPlanPayload = { mealPlan_delete: boolean };

const LIST_QUERY = `
  query ListMealPlans($input: ListMealPlansInput) {
    mealPlan_list(input: $input) {
      items {
        id
        slug
        locale
        label
        description
        visibility
        calories
        proteinGrams
        carbGrams
        fatGrams
        days {
          id
          templateMealDayId
          slug
          locale
          label
          description
          meals {
            id
            templateMealId
            slug
            locale
            label
            description
            foods
            calories
            proteinGrams
            carbGrams
            fatGrams
            type {
              id
              templateMealTypeId
              slug
              locale
              label
              visibility
            }
          }
        }
        userId
        athlete { id email }
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
  mutation CreateMealPlan($input: CreateMealPlanInput!) {
    mealPlan_create(input: $input) {
      id
      slug
      locale
      label
      description
      visibility
      calories
      proteinGrams
      carbGrams
      fatGrams
      days {
        id
        templateMealDayId
        slug
        locale
        label
        description
        meals {
          id
          templateMealId
          slug
          locale
          label
          description
          foods
          calories
          proteinGrams
          carbGrams
          fatGrams
          type {
            id
            templateMealTypeId
            slug
            locale
            label
            visibility
          }
        }
      }
      userId
      athlete { id email }
      createdBy
      createdAt
      updatedAt
      creator { id email }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateMealPlan($input: UpdateMealPlanInput!) {
    mealPlan_update(input: $input) {
      id
      slug
      locale
      label
      description
      visibility
      calories
      proteinGrams
      carbGrams
      fatGrams
      days {
        id
        templateMealDayId
        slug
        locale
        label
        description
        meals {
          id
          templateMealId
          slug
          locale
          label
          description
          foods
          calories
          proteinGrams
          carbGrams
          fatGrams
          type {
            id
            templateMealTypeId
            slug
            locale
            label
            visibility
          }
        }
      }
      userId
      athlete { id email }
      createdBy
      createdAt
      updatedAt
      creator { id email }
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteMealPlan($id: ID!) {
    mealPlan_delete(id: $id)
  }
`;

export interface UseMealPlansParams {
  page: number;
  limit: number;
  q: string;
  userId?: string;
}

export interface UseMealPlansResult {
  items: MealPlan[];
  total: number;
  loading: boolean;
  create: (input: {
    locale: string;
    label: string;
    description?: string;
    calories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    days?: MealPlanDaySnapshot[];
    userId?: string;
    visibility: MealPlanVisibility;
  }) => Promise<void>;
  update: (input: {
    id: string;
    locale?: string;
    label?: string;
    description?: string;
    calories?: number;
    proteinGrams?: number;
    carbGrams?: number;
    fatGrams?: number;
    days?: MealPlanDaySnapshot[];
    userId?: string;
    visibility?: MealPlanVisibility;
  }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useMealPlans({ page, limit, q, userId }: UseMealPlansParams): UseMealPlansResult {
  const [items, setItems] = React.useState<MealPlan[]>([]);
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
        gql.send<MealPlanListPayload>({
          query: LIST_QUERY,
          operationName: 'ListMealPlans',
          variables: {
            input: {
              page,
              limit,
              q: q || undefined,
              userId: userId || undefined,
            },
          },
        }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setItems(data?.mealPlan_list.items ?? []);
      setTotal(data?.mealPlan_list.total ?? 0);
    } catch (error: any) {
      flashError(error?.message ?? 'Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql, limit, page, q, userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback<UseMealPlansResult['create']>(
    async (input) => {
      try {
        const { errors } = await execute(() =>
          gql.send<CreateMealPlanPayload>({
            query: CREATE_MUTATION,
            operationName: 'CreateMealPlan',
            variables: { input: { ...input, description: input.description ?? undefined, visibility: input.visibility } },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal plan created');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Create failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const update = React.useCallback<UseMealPlansResult['update']>(
    async (input) => {
      try {
        const { errors } = await execute(() =>
          gql.send<UpdateMealPlanPayload>({
            query: UPDATE_MUTATION,
            operationName: 'UpdateMealPlan',
            variables: {
              input: {
                ...input,
                description: input.description ?? undefined,
                visibility: input.visibility ?? undefined,
              },
            },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal plan updated');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Update failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  const remove = React.useCallback<UseMealPlansResult['remove']>(
    async (id) => {
      try {
        const { errors } = await execute(() =>
          gql.send<DeleteMealPlanPayload>({
            query: DELETE_MUTATION,
            operationName: 'DeleteMealPlan',
            variables: { id },
          }),
        );
        if (errors?.length) throw new Error(errors[0].message);
        flashSuccess('Meal plan deleted');
        await load();
      } catch (error: any) {
        flashError(error?.message ?? 'Delete failed');
        throw error;
      }
    },
    [execute, flashError, flashSuccess, gql, load],
  );

  return { items, total, loading, create, update, remove, reload: load };
}
