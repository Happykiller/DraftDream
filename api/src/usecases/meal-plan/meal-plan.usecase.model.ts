// src/usecases/meal-plan/meal-plan.usecase.model.ts

export type MealPlanMealTypeUsecaseModel = {
  id?: string;
  templateMealTypeId?: string;
  slug?: string;
  locale?: string;
  label: string;
  visibility?: 'private' | 'public';
};

export type MealPlanMealUsecaseModel = {
  id: string;
  templateMealId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  type: MealPlanMealTypeUsecaseModel;
};

export type MealPlanDayUsecaseModel = {
  id: string;
  templateMealDayId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  meals: MealPlanMealUsecaseModel[];
};

export type MealPlanUsecaseModel = {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDayUsecaseModel[];
  userId?: string;
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
