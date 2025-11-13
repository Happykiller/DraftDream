// src/hooks/nutrition/useMealPlan.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { mealPlanGet } from '@services/graphql/mealPlans.service';

import type { MealPlan } from './useMealPlans';

import { useAsyncTask } from '../useAsyncTask';

export interface UseMealPlanOptions {
  mealPlanId?: string | null;
  initialMealPlan?: MealPlan | null;
  initialError?: string | null;
}

export interface UseMealPlanResult {
  mealPlan: MealPlan | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<MealPlan | null>;
}

/**
 * Fetches a meal plan and keeps track of loading / error states compatible with route loaders.
 */
export function useMealPlan({
  mealPlanId,
  initialMealPlan = null,
  initialError = null,
}: UseMealPlanOptions = {}): UseMealPlanResult {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const [mealPlan, setMealPlan] = React.useState<MealPlan | null>(initialMealPlan);
  const [error, setError] = React.useState<string | null>(initialError);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(
    async (idToLoad: string): Promise<MealPlan | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await execute(() => mealPlanGet({ mealPlanId: idToLoad }));

        if (!result) {
          const message = t('nutrition-details.errors.not_found');
          setMealPlan(null);
          setError(message);
          return null;
        }

        setMealPlan(result);
        return result;
      } catch (caught: unknown) {
        console.error('[useMealPlan] Failed to load meal plan', caught);
        const message = t('nutrition-details.errors.load_failed');
        setMealPlan(null);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [execute, t],
  );

  React.useEffect(() => {
    setMealPlan(initialMealPlan);
  }, [initialMealPlan]);

  React.useEffect(() => {
    setError(initialError);
  }, [initialError]);

  React.useEffect(() => {
    if (!mealPlanId) {
      setMealPlan(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (initialMealPlan && initialMealPlan.id === mealPlanId) {
      setLoading(false);
      return;
    }

    if (initialError) {
      setLoading(false);
      return;
    }

    void load(mealPlanId);
  }, [initialError, initialMealPlan, load, mealPlanId]);

  const reload = React.useCallback(async () => {
    if (!mealPlanId) {
      setMealPlan(null);
      setError(null);
      return null;
    }

    return load(mealPlanId);
  }, [load, mealPlanId]);

  return { mealPlan, loading, error, reload };
}
