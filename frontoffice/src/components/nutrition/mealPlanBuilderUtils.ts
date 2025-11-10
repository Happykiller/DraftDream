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

import type { MealPlanBuilderMeal } from './mealPlanBuilderTypes';

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
