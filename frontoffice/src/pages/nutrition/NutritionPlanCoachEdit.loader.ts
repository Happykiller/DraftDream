// src/pages/nutrition/NutritionPlanCoachEdit.loader.ts
import type { MealPlan } from '@hooks/nutrition/useMealPlans';
import { mealPlanGet } from '@services/graphql/mealPlans.service';

export interface NutritionPlanCoachEditLoaderResult {
  mealPlan: MealPlan | null;
  error: string | null;
}

/** Loads a nutrition plan before entering the coach edition flow. */
export async function nutritionPlanCoachEditLoader({
  params,
}: { params: Record<string, string | undefined> }): Promise<NutritionPlanCoachEditLoaderResult> {
  const mealPlanId = params.mealPlanId;
  if (!mealPlanId) {
    return { mealPlan: null, error: 'not_found' } satisfies NutritionPlanCoachEditLoaderResult;
  }

  try {
    const mealPlan = await mealPlanGet({ mealPlanId });
    if (!mealPlan) {
      return { mealPlan: null, error: 'not_found' } satisfies NutritionPlanCoachEditLoaderResult;
    }
    return { mealPlan, error: null } satisfies NutritionPlanCoachEditLoaderResult;
  } catch (caught: unknown) {
    console.error('[nutritionPlanCoachEditLoader] Failed to load meal plan', caught);
    return { mealPlan: null, error: 'load_failed' } satisfies NutritionPlanCoachEditLoaderResult;
  }
}
