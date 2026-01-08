// src/services/db/models/meal-plan.model.ts

export interface MealPlanMealTypeSnapshot {
  id?: string;
  templateMealTypeId?: string;
  slug?: string;
  locale?: string;
  label: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface MealPlanMealSnapshot {
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
  type: MealPlanMealTypeSnapshot;
}

export interface MealPlanDaySnapshot {
  id: string;
  templateMealDayId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  meals: MealPlanMealSnapshot[];
}

export interface MealPlan {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  /** Optional start date of the plan (day precision). */
  startDate?: Date;
  /** Optional end date of the plan (day precision). */
  endDate?: Date;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDaySnapshot[];
  userId?: string;
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
