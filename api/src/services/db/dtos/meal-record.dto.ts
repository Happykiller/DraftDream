// src/services/db/dtos/meal-record.dto.ts
import { MealRecordState } from '@src/common/meal-record-state.enum';
import type { MealPlanMealSnapshot } from '@src/services/db/models/meal-plan.model';

export interface CreateMealRecordDto {
  userId: string;
  mealPlanId: string;
  mealDayId: string;
  mealId: string;
  mealSnapshot?: MealPlanMealSnapshot;
  state: MealRecordState;
  createdBy: string;
}

export interface GetMealRecordDto {
  id: string;
}

export interface ListMealRecordsDto {
  userId?: string;
  mealPlanId?: string;
  mealDayId?: string;
  mealId?: string;
  state?: MealRecordState;
  createdBy?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}

export interface UpdateMealRecordDto {
  state?: MealRecordState;
}
