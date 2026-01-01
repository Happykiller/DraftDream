// src/graphql/nutri/meal-record/meal-record.mapper.ts
import { MealRecordGql } from '@graphql/nutri/meal-record/meal-record.gql.types';
import { MealPlanMealSnapshotGql, MealPlanMealTypeSnapshotGql } from '@graphql/nutri/meal-plan/meal-plan.gql.types';
import { MealTypeVisibility } from '@graphql/nutri/meal-type/meal-type.gql.types';
import type { MealPlanMealTypeUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';
import { MealRecordUsecaseModel } from '@src/usecases/nutri/meal-record/meal-record.usecase.model';

/**
 * Maps use case models into GraphQL DTOs.
 */
const mapMealType = (type: MealPlanMealTypeUsecaseModel): MealPlanMealTypeSnapshotGql => ({
  id: type.id ?? null,
  templateMealTypeId: type.templateMealTypeId ?? null,
  slug: type.slug ?? null,
  locale: type.locale ?? null,
  label: type.label,
  visibility: normalizeVisibility(type.visibility),
});

const mapMealSnapshot = (meal?: MealRecordUsecaseModel['mealSnapshot'] | null): MealPlanMealSnapshotGql | null => {
  if (!meal) {
    return null;
  }

  return {
    id: meal.id,
    templateMealId: meal.templateMealId ?? null,
    slug: meal.slug ?? null,
    locale: meal.locale ?? null,
    label: meal.label,
    description: meal.description ?? null,
    foods: meal.foods,
    calories: meal.calories,
    proteinGrams: meal.proteinGrams,
    carbGrams: meal.carbGrams,
    fatGrams: meal.fatGrams,
    type: mapMealType(meal.type),
  };
};

export const mapMealRecordUsecaseToGql = (model: MealRecordUsecaseModel): MealRecordGql => ({
  id: model.id,
  userId: model.userId,
  mealPlanId: model.mealPlanId,
  mealDayId: model.mealDayId,
  mealId: model.mealId,
  mealSnapshot: mapMealSnapshot(model.mealSnapshot ?? null),
  comment: model.comment,
  satisfactionRating: model.satisfactionRating,
  state: model.state,
  createdBy: model.createdBy,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
  deletedAt: model.deletedAt,
});

function normalizeVisibility(
  visibility?: MealPlanMealTypeUsecaseModel['visibility'],
): MealTypeVisibility | null {
  if (!visibility) {
    return null;
  }
  return visibility === 'PUBLIC' ? MealTypeVisibility.PUBLIC : MealTypeVisibility.PRIVATE;
}
