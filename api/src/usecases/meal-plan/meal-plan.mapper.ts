// src/usecases/meal-plan/meal-plan.mapper.ts

import {
  MealPlan,
  MealPlanDaySnapshot,
  MealPlanMealSnapshot,
  MealPlanMealTypeSnapshot,
} from '@services/db/models/meal-plan.model';
import {
  MealPlanDayUsecaseModel,
  MealPlanMealTypeUsecaseModel,
  MealPlanMealUsecaseModel,
  MealPlanUsecaseModel,
} from '@usecases/meal-plan/meal-plan.usecase.model';

const mapMealType = (type: MealPlanMealTypeSnapshot): MealPlanMealTypeUsecaseModel => ({
  id: type.id,
  templateMealTypeId: type.templateMealTypeId,
  slug: type.slug,
  locale: type.locale,
  label: type.label,
  visibility: type.visibility,
});

const mapMeal = (meal: MealPlanMealSnapshot): MealPlanMealUsecaseModel => ({
  id: meal.id,
  templateMealId: meal.templateMealId,
  slug: meal.slug,
  locale: meal.locale,
  label: meal.label,
  description: meal.description,
  foods: meal.foods,
  calories: meal.calories,
  proteinGrams: meal.proteinGrams,
  carbGrams: meal.carbGrams,
  fatGrams: meal.fatGrams,
  type: mapMealType(meal.type),
});

const mapDay = (day: MealPlanDaySnapshot): MealPlanDayUsecaseModel => ({
  id: day.id,
  templateMealDayId: day.templateMealDayId,
  slug: day.slug,
  locale: day.locale,
  label: day.label,
  description: day.description,
  meals: (day.meals ?? []).map(mapMeal),
});

export const mapMealPlanToUsecase = (plan: MealPlan): MealPlanUsecaseModel => ({
  id: plan.id,
  slug: plan.slug,
  locale: plan.locale,
  label: plan.label,
  description: plan.description,
  visibility: plan.visibility,
  calories: plan.calories,
  proteinGrams: plan.proteinGrams,
  carbGrams: plan.carbGrams,
  fatGrams: plan.fatGrams,
  days: (plan.days ?? []).map(mapDay),
  userId: plan.userId,
  createdBy: plan.createdBy,
  deletedAt: plan.deletedAt,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});
