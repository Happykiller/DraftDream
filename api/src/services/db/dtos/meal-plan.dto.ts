// src/services/db/dtos/meal-plan.dto.ts

export type MealPlanMealTypeSnapshotDto = {
  id?: string;
  templateMealTypeId?: string;
  slug?: string;
  locale?: string;
  label: string;
  visibility?: 'private' | 'public';
};

export type MealPlanMealSnapshotDto = {
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
  type: MealPlanMealTypeSnapshotDto;
};

export type MealPlanDaySnapshotDto = {
  id: string;
  templateMealDayId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  meals: MealPlanMealSnapshotDto[];
};

export type CreateMealPlanDto = {
  slug: string;
  locale: string;
  label: string;
  description?: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDaySnapshotDto[];
  userId?: string;
  createdBy: string;
};

export type GetMealPlanDto = { id: string };

export type ListMealPlansDto = {
  q?: string;
  locale?: string;
  createdBy?: string;
  createdByIn?: string[];
  userId?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
};

export type UpdateMealPlanDto = Partial<{
  slug: string;
  locale: string;
  label: string;
  description: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDaySnapshotDto[];
  userId: string;
}>;
