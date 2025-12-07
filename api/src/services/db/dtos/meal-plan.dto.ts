// src/services/db/dtos/meal-plan.dto.ts

export interface MealPlanMealTypeSnapshotDto {
  id?: string;
  templateMealTypeId?: string;
  slug?: string;
  locale?: string;
  label: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
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
  visibility?: 'PRIVATE' | 'PUBLIC';
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
  visibility?: 'PRIVATE' | 'PUBLIC';
  userId?: string;
  includePublicVisibility?: boolean;
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
  visibility: 'PRIVATE' | 'PUBLIC';
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDaySnapshotDto[];
  userId: string | null;
}>;
