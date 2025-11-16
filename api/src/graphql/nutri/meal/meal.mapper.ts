// src/graphql/meal/meal.mapper.ts
import { MealUsecaseModel } from '@usecases/meal/meal.usecase.model';

import {
  MealGql,
  MealVisibility,
} from '@src/graphql/nutri/meal/meal.gql.types';

/** Maps a meal use case model to its GraphQL representation. */
export function mapMealUsecaseToGql(model: MealUsecaseModel): MealGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    typeId: model.typeId,
    foods: model.foods,
    calories: model.calories,
    proteinGrams: model.proteinGrams,
    carbGrams: model.carbGrams,
    fatGrams: model.fatGrams,
    visibility: model.visibility as MealVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
