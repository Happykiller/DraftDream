// src/usecases/nutri/meal-record/meal-record.mapper.ts
import { MealRecord } from '@services/db/models/meal-record.model';

import { MealRecordUsecaseModel } from './meal-record.usecase.model';

/**
 * Maps persistence models into use case models.
 */
export const mapMealRecordToUsecase = (record: MealRecord): MealRecordUsecaseModel => ({
  id: record.id,
  userId: record.userId,
  mealPlanId: record.mealPlanId,
  mealDayId: record.mealDayId,
  mealId: record.mealId,
  mealSnapshot: record.mealSnapshot,
  comment: record.comment,
  satisfactionRating: record.satisfactionRating,
  state: record.state,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
  deletedAt: record.deletedAt,
});
