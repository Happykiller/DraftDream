// src/usecases/meal-day/meal-day.mapper.ts
import { MealDay } from '@services/db/models/meal-day.model';
import type { MealDayUsecaseModel } from '@usecases/meal-day/meal-day.usecase.model';

export const mapMealDayToUsecase = (mealDay: MealDay): MealDayUsecaseModel => ({
  id: mealDay.id,
  slug: mealDay.slug,
  locale: mealDay.locale,

  label: mealDay.label,
  description: mealDay.description,

  mealIds: [...mealDay.mealIds],

  visibility: mealDay.visibility,
  createdBy: mealDay.createdBy,
  deletedAt: mealDay.deletedAt,
  createdAt: mealDay.createdAt,
  updatedAt: mealDay.updatedAt,
});

