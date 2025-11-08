// src/hooks/nutrition/useMealPlans.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface MealPlanUserSummary {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
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
  id?: string | null;
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
  id?: string | null;
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
type DeleteMealPlanPayload = { mealPlan_softDelete: boolean };

const LIST_QUERY = `
  query ListMealPlans($input: ListMealPlansInput) {
    mealPlan_list(input: $input) {
      items {
        id
        slug
        locale
        label
        description
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
        athlete { id email first_name last_name }
        createdBy
        createdAt
        updatedAt
        creator { id email first_name last_name }
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
      athlete { id email first_name last_name }
      createdBy
      createdAt
      updatedAt
      creator { id email first_name last_name }
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
      athlete { id email first_name last_name }
      createdBy
      createdAt
      updatedAt
      creator { id email first_name last_name }
    }
  }
`;

const SOFT_DELETE_MUTATION = `
  mutation SoftDeleteMealPlan($id: ID!) {
    mealPlan_softDelete(id: $id)
  }
`;

function normalizeMealType(input: MealPlanMealTypeSnapshot) {
  return {
    id: input.id || undefined,
    templateMealTypeId: input.templateMealTypeId || undefined,
    slug: input.slug || undefined,
    locale: input.locale || undefined,
    label: input.label,
    visibility: input.visibility || undefined,
  };
}

function normalizeMeal(input: MealPlanMealSnapshot) {
  return {
    id: input.id || undefined,
    templateMealId: input.templateMealId || undefined,
    slug: input.slug || undefined,
    locale: input.locale || undefined,
    label: input.label,
    description: input.description ?? undefined,
    foods: input.foods,
    calories: input.calories,
    proteinGrams: input.proteinGrams,
    carbGrams: input.carbGrams,
    fatGrams: input.fatGrams,
    type: normalizeMealType(input.type),
  };
}

function normalizeDay(input: MealPlanDaySnapshot) {
  return {
    id: input.id || undefined,
    templateMealDayId: input.templateMealDayId || undefined,
    slug: input.slug || undefined,
    locale: input.locale || undefined,
    label: input.label,
    description: input.description ?? undefined,
    meals: input.meals.map(normalizeMeal),
  };
}

export interface UseMealPlansParams {
  page: number; // 1-based index
  limit: number;
  q: string;
  createdBy?: string;
  userId?: string;
}

export interface MealPlanCreateInput {
  slug?: string;
  locale?: string;
  label: string;
  description?: string | null;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days?: MealPlanDaySnapshot[];
  dayIds?: string[];
  userId?: string | null;
}

export interface MealPlanUpdateInput extends Partial<Omit<MealPlanCreateInput, 'label'>> {
  id: string;
  label?: string;
}

export interface UseMealPlansResult {
  items: MealPlan[];
  total: number;
  loading: boolean;
  create: (input: MealPlanCreateInput) => Promise<MealPlan>;
  update: (input: MealPlanUpdateInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Provides CRUD helpers for nutrition meal plans using the shared GraphQL transport.
 */
export function useMealPlans({
  page,
  limit,
  q,
  createdBy,
  userId,
}: UseMealPlansParams): UseMealPlansResult {
  const { t, i18n } = useTranslation();
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
      await execute(async () => {
        const trimmedQuery = q.trim();
        const { data, errors } = await gql.send<MealPlanListPayload>({
          query: LIST_QUERY,
          operationName: 'ListMealPlans',
          variables: {
            input: {
              page,
              limit,
              ...(trimmedQuery ? { q: trimmedQuery } : {}),
              ...(createdBy ? { createdBy } : {}),
              ...(userId ? { userId } : {}),
            },
          },
        });

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        setItems(data?.mealPlan_list.items ?? []);
        setTotal(data?.mealPlan_list.total ?? 0);
      });
    } catch (caught: unknown) {
      const message =
        caught instanceof Error
          ? caught.message
          : t('nutrition-plans.errors.load_failed');
      flashError(message);
    } finally {
      setLoading(false);
    }
  }, [createdBy, execute, flashError, gql, limit, page, q, t, userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = React.useCallback<UseMealPlansResult['create']>(
    async (input) => {
      const locale = (input.locale ?? i18n.language)?.trim() || i18n.language;
      const slug = input.slug?.trim();
      const payload = {
        ...input,
        slug: slug && slug.length ? slug : undefined,
        locale,
        description: input.description ?? undefined,
        userId: input.userId ?? undefined,
        dayIds: input.dayIds?.filter(Boolean),
        days: input.days?.map(normalizeDay),
      };

      try {
        const { data, errors } = await execute(() =>
          gql.send<CreateMealPlanPayload>({
            query: CREATE_MUTATION,
            operationName: 'CreateMealPlan',
            variables: { input: payload },
          }),
        );

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        const createdMealPlan = data?.mealPlan_create;
        if (!createdMealPlan) {
          throw new Error(t('nutrition-plans.notifications.create_failed'));
        }

        flashSuccess(t('nutrition-plans.notifications.created'));
        await load();
        return createdMealPlan;
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.create_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, i18n.language, load, t],
  );

  const update = React.useCallback<UseMealPlansResult['update']>(
    async (input) => {
      const locale = (input.locale ?? i18n.language)?.trim() || i18n.language;
      const slug = input.slug?.trim();
      const payload = {
        ...input,
        slug: slug && slug.length ? slug : undefined,
        locale,
        description: input.description ?? undefined,
        userId: input.userId ?? undefined,
        dayIds: input.dayIds?.filter(Boolean),
        days: input.days?.map(normalizeDay),
      };

      try {
        const { errors } = await execute(() =>
          gql.send<UpdateMealPlanPayload>({
            query: UPDATE_MUTATION,
            operationName: 'UpdateMealPlan',
            variables: { input: payload },
          }),
        );

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        flashSuccess(t('nutrition-plans.notifications.updated'));
        await load();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.update_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, i18n.language, load, t],
  );

  const remove = React.useCallback<UseMealPlansResult['remove']>(
    async (id) => {
      try {
        const { data, errors } = await execute(() =>
          gql.send<DeleteMealPlanPayload>({
            query: SOFT_DELETE_MUTATION,
            operationName: 'SoftDeleteMealPlan',
            variables: { id },
          }),
        );

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        if (!data?.mealPlan_softDelete) {
          throw new Error(t('nutrition-plans.notifications.delete_failed'));
        }

        flashSuccess(t('nutrition-plans.notifications.deleted'));
        await load();
      } catch (caught: unknown) {
        const message =
          caught instanceof Error
            ? caught.message
            : t('nutrition-plans.notifications.delete_failed');
        flashError(message);
        throw caught;
      }
    },
    [execute, flashError, flashSuccess, gql, load, t],
  );

  return { items, total, loading, create, update, remove, reload: load };
}
