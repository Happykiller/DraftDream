// src/graphql/meal-type/meal-type.mapper.ts
import { MealTypeUsecaseModel } from '@usecases/meal-type/meal-type.usecase.model';

import {
  MealTypeGql,
  MealTypeVisibility,
} from '@graphql/meal-type/meal-type.gql.types';

/** Maps a meal type use case model to its GraphQL representation. */
export function mapMealTypeUsecaseToGql(model: MealTypeUsecaseModel): MealTypeGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    visibility: model.visibility as MealTypeVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
