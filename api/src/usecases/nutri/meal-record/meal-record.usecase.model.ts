// src/usecases/nutri/meal-record/meal-record.usecase.model.ts
import { MealRecordState } from '@src/common/meal-record-state.enum';
import type { MealPlanMealUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

export type MealRecordMealSnapshotUsecaseModel = MealPlanMealUsecaseModel;

export interface MealPlanSnapshotUsecaseModel {
  id: string;
  label: string;
}

export interface MealRecordUsecaseModel {
  id: string;
  userId: string;
  mealPlanId: string;
  mealPlanSnapshot?: MealPlanSnapshotUsecaseModel;
  mealDayId: string;
  mealId: string;
  mealSnapshot?: MealRecordMealSnapshotUsecaseModel;
  comment?: string;
  satisfactionRating?: number;
  state: MealRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
