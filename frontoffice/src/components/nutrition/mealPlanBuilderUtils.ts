// src/components/nutrition/mealPlanBuilderUtils.ts
import type { SvgIconComponent } from '@mui/icons-material';
import {
  BrunchDining,
  DinnerDining,
  EggAlt,
  LunchDining,
  RamenDining,
  SoupKitchen,
} from '@mui/icons-material';

import type {
  MealPlanBuilderDay,
  MealPlanBuilderMeal,
  MealPlanBuilderNutritionSummary,
} from './mealPlanBuilderTypes';

const MEAL_ICON_COMPONENTS: readonly SvgIconComponent[] = [
  BrunchDining,
  DinnerDining,
  EggAlt,
  LunchDining,
  RamenDining,
  SoupKitchen,
];

export function formatMealSummary(meal: MealPlanBuilderMeal): string {
  return `${meal.calories} cal • ${meal.proteinGrams}g P • ${meal.carbGrams}g G • ${meal.fatGrams}g L`;
}

function computeMealIconIndex(reference: string): number {
  let hash = 0;

  for (let index = 0; index < reference.length; index += 1) {
    hash = (hash * 31 + reference.charCodeAt(index)) >>> 0;
  }

  return hash % MEAL_ICON_COMPONENTS.length;
}

export function getMealIcon(reference: string): SvgIconComponent {
  return MEAL_ICON_COMPONENTS[computeMealIconIndex(reference)];
}

export function computePlanNutritionSummary(days: MealPlanBuilderDay[]): MealPlanBuilderNutritionSummary {
  return days.reduce<MealPlanBuilderNutritionSummary>(
    (totals, day) => {
      day.meals.forEach((meal) => {
        const calories = Number(meal.calories ?? 0);
        const protein = Number(meal.proteinGrams ?? 0);
        const carbs = Number(meal.carbGrams ?? 0);
        const fats = Number(meal.fatGrams ?? 0);

        totals.calories += Number.isFinite(calories) ? calories : 0;
        totals.proteinGrams += Number.isFinite(protein) ? protein : 0;
        totals.carbGrams += Number.isFinite(carbs) ? carbs : 0;
        totals.fatGrams += Number.isFinite(fats) ? fats : 0;
      });

      return totals;
    },
    { calories: 0, proteinGrams: 0, carbGrams: 0, fatGrams: 0 },
  );
}
