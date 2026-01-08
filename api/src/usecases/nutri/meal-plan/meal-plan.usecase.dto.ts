// src/usecases/nutri/meal-plan/meal-plan.usecase.dto.ts

import { Role } from '@src/common/role.enum';

export interface UsecaseSession {
  userId: string;
  role: Role;
}

export interface MealPlanMealTypeSnapshotUsecaseDto {
  id?: string;
  templateMealTypeId?: string;
  slug?: string;
  locale?: string;
  label: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface MealPlanMealSnapshotUsecaseDto {
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
  type: MealPlanMealTypeSnapshotUsecaseDto;
}

export interface MealPlanDaySnapshotUsecaseDto {
  id: string;
  templateMealDayId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  meals: MealPlanMealSnapshotUsecaseDto[];
}

/**
 * Independent usecase DTO for creating meal plans.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateMealPlanUsecaseDto {
  locale: string;
  label: string;
  description?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  startDate?: Date;
  endDate?: Date;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDaySnapshotUsecaseDto[];
  userId?: string | null;
  createdBy: string;
}

export interface GetMealPlanUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface ListMealPlansUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  createdByIn?: string[];
  visibility?: 'PRIVATE' | 'PUBLIC';
  userId?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
  session: UsecaseSession;
}

/**
 * Independent usecase DTO for updating meal plans.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateMealPlanUsecaseDto {
  id: string;
  locale?: string;
  label?: string;
  description?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  startDate?: Date | null;
  endDate?: Date | null;
  calories?: number;
  proteinGrams?: number;
  carbGrams?: number;
  fatGrams?: number;
  days?: MealPlanDaySnapshotUsecaseDto[];
  userId?: string | null;
}

export interface DeleteMealPlanUsecaseDto {
  id: string;
  session: UsecaseSession;
}
