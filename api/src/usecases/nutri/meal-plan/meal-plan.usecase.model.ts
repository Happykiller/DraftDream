// src/usecases/meal-plan/meal-plan.usecase.model.ts

export interface MealPlanMealTypeUsecaseModel {
  id?: string;
  templateMealTypeId?: string;
  slug?: string;
  locale?: string;
  label: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface MealPlanMealUsecaseModel {
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
}

export interface MealPlanDayUsecaseModel {
  id: string;
  templateMealDayId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  meals: MealPlanMealUsecaseModel[];
}

export interface MealPlanUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  startDate?: Date;
  endDate?: Date;
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
}
