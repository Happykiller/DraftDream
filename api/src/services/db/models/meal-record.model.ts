// src/services/db/models/meal-record.model.ts
import { MealRecordState } from '@src/common/meal-record-state.enum';
import type { MealPlanMealSnapshot } from '@src/services/db/models/meal-plan.model';

export interface MealRecord {
  id: string;
  userId: string;
  mealPlanId: string;
  mealDayId: string;
  mealId: string;
  mealSnapshot?: MealPlanMealSnapshot;
  comment?: string;
  satisfactionRating?: number;
  state: MealRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
