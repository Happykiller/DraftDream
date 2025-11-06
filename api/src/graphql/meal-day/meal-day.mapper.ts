// src/graphql/meal-day/meal-day.mapper.ts

import type { MealDayUsecaseModel } from '@usecases/meal-day/meal-day.usecase.model';

import { MealDayGql, MealDayVisibility } from '@graphql/meal-day/meal-day.gql.types';

export function mapMealDayUsecaseToGql(model: MealDayUsecaseModel): MealDayGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    description: model.description,
    mealIds: [...model.mealIds],
    visibility: model.visibility as MealDayVisibility,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

