import { describe, expect, it } from '@jest/globals';
import { mapMealTypeUsecaseToGql } from '../meal-type.mapper';

import { MealTypeVisibility } from '@src/graphql/nutri/meal-type/meal-type.gql.types';
import type { MealTypeUsecaseModel } from '@src/usecases/nutri/meal-type/meal-type.usecase.model';

describe('mapMealTypeUsecaseToGql', () => {
  it('casts visibility to the GraphQL enum', () => {
    const createdAt = new Date('2023-02-01T00:00:00.000Z');
    const updatedAt = new Date('2023-02-02T00:00:00.000Z');

    const model: MealTypeUsecaseModel = {
      id: 'meal-type-1',
      slug: 'breakfast',
      locale: 'fr-FR',
      label: 'Petit déjeuner',
      icon: 'coffee',
      visibility: 'PRIVATE',
      createdBy: 'coach-2',
      createdAt,
      updatedAt,
    };

    const result = mapMealTypeUsecaseToGql(model);

    expect(result).toEqual({
      id: 'meal-type-1',
      slug: 'breakfast',
      locale: 'fr-FR',
      label: 'Petit déjeuner',
      icon: 'coffee',
      visibility: MealTypeVisibility.PRIVATE,
      createdBy: 'coach-2',
      createdAt,
      updatedAt,
    });
  });
});
