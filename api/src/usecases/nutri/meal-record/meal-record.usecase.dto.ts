// src/usecases/nutri/meal-record/meal-record.usecase.dto.ts
import { MealRecordState } from '@src/common/meal-record-state.enum';
import { Role } from '@src/common/role.enum';

export interface UsecaseSession {
  userId: string;
  role: Role;
}

export interface CreateMealRecordUsecaseDto {
  userId?: string;
  mealPlanId: string;
  mealDayId: string;
  mealId: string;
  state?: MealRecordState;
  session: UsecaseSession;
}

export interface GetMealRecordUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface ListMealRecordsUsecaseDto {
  userId?: string;
  mealPlanId?: string;
  mealDayId?: string;
  mealId?: string;
  state?: MealRecordState;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

export interface UpdateMealRecordUsecaseDto {
  id: string;
  state: MealRecordState;
  session: UsecaseSession;
}

export interface DeleteMealRecordUsecaseDto {
  id: string;
  session: UsecaseSession;
}
