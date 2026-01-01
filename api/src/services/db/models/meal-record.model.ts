// src/services/db/models/meal-record.model.ts
import { MealRecordState } from '@src/common/meal-record-state.enum';

export interface MealRecord {
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
