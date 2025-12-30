// src/usecases/nutri/meal-record/meal-record.usecase.model.ts
import { MealRecordState } from '@src/common/meal-record-state.enum';

export interface MealRecordUsecaseModel {
  id: string;
  userId: string;
  mealPlanId: string;
  mealDayId: string;
  mealId: string;
  state: MealRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
