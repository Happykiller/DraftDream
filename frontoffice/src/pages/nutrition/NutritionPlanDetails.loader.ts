// src/pages/nutrition/NutritionPlanDetails.loader.ts
import type { LoaderFunctionArgs } from 'react-router-dom';

import type { MealPlan } from '@hooks/nutrition/useMealPlans';
import { mealPlanGet } from '@services/graphql/mealPlans.service';

export type NutritionPlanDetailsLoaderStatus = 'success' | 'not_found' | 'error';

export interface NutritionPlanDetailsLoaderResult {
  mealPlan: MealPlan | null;
  status: NutritionPlanDetailsLoaderStatus;
}

/** Fetches the nutrition plan shown on the details page. */
export async function nutritionPlanDetailsLoader({
  params,
}: LoaderFunctionArgs): Promise<NutritionPlanDetailsLoaderResult> {
  const mealPlanId = params.mealPlanId;
  if (!mealPlanId) {
    return { mealPlan: null, status: 'not_found' } satisfies NutritionPlanDetailsLoaderResult;
  }

  try {
    const mealPlan = await mealPlanGet({ mealPlanId });
    if (!mealPlan) {
      return { mealPlan: null, status: 'not_found' } satisfies NutritionPlanDetailsLoaderResult;
    }

    return { mealPlan, status: 'success' } satisfies NutritionPlanDetailsLoaderResult;
  } catch (caught: unknown) {
    console.error('[nutritionPlanDetailsLoader] Failed to fetch meal plan', caught);
    return { mealPlan: null, status: 'error' } satisfies NutritionPlanDetailsLoaderResult;
  }
}
