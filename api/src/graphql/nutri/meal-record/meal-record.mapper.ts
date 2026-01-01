// src/graphql/nutri/meal-record/meal-record.mapper.ts
import { MealRecordGql } from '@graphql/nutri/meal-record/meal-record.gql.types';
import { MealRecordUsecaseModel } from '@src/usecases/nutri/meal-record/meal-record.usecase.model';

/**
 * Maps use case models into GraphQL DTOs.
 */
export const mapMealRecordUsecaseToGql = (model: MealRecordUsecaseModel): MealRecordGql => ({
  id: model.id,
  userId: model.userId,
  mealPlanId: model.mealPlanId,
  mealDayId: model.mealDayId,
  mealId: model.mealId,
  state: model.state,
  createdBy: model.createdBy,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
  deletedAt: model.deletedAt,
});
