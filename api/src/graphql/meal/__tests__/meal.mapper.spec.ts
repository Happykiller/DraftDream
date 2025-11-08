import { mapMealUsecaseToGql } from '../meal.mapper';

import { MealVisibility } from '@graphql/meal/meal.gql.types';
import type { MealUsecaseModel } from '@usecases/meal/meal.usecase.model';

describe('mapMealUsecaseToGql', () => {
  it('maps use case fields to their GraphQL representation', () => {
    const createdAt = new Date('2023-01-01T00:00:00.000Z');
    const updatedAt = new Date('2023-01-02T00:00:00.000Z');

    const model: MealUsecaseModel = {
      id: 'meal-1',
      slug: 'breakfast',
      locale: 'fr-FR',
      label: 'Petit déjeuner',
      typeId: 'meal-type-1',
      foods: 'Omelette',
      calories: 600,
      proteinGrams: 40,
      carbGrams: 50,
      fatGrams: 20,
      visibility: 'public',
      createdBy: 'coach-1',
      createdAt,
      updatedAt,
    };

    const result = mapMealUsecaseToGql(model);

    expect(result).toEqual({
      id: 'meal-1',
      slug: 'breakfast',
      locale: 'fr-FR',
      label: 'Petit déjeuner',
      typeId: 'meal-type-1',
      foods: 'Omelette',
      calories: 600,
      proteinGrams: 40,
      carbGrams: 50,
      fatGrams: 20,
      visibility: MealVisibility.PUBLIC,
      createdBy: 'coach-1',
      createdAt,
      updatedAt,
    });
  });
});
