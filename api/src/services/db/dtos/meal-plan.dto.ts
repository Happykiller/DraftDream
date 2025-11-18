// src/services/db/dtos/meal-plan.dto.ts

export interface MealPlanMealTypeSnapshotDto {
  id?: string;
  templateMealTypeId?: string;
  slug?: string;
  locale?: string;
  label: string;
  visibility?: 'private' | 'public';
}

export interface MealPlanMealSnapshotDto {
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
}

export interface MealPlanDaySnapshotDto {
  id: string;
  templateMealDayId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  meals: MealPlanMealSnapshotDto[];
}

export interface CreateMealPlanDto {
  slug: string;
  locale: string;
  label: string;
  description?: string;
  visibility?: 'private' | 'public';
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDaySnapshotDto[];
  userId?: string | null;
  createdBy: string;
}

export interface GetMealPlanDto { id: string }

export interface ListMealPlansDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  createdByIn?: string[];
  visibility?: 'private' | 'public';
  userId?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}

export type UpdateMealPlanDto = Partial<{
  slug: string;
  locale: string;
  label: string;
  description: string;
  visibility: 'private' | 'public';
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDaySnapshotDto[];
  userId: string | null;
}>;
