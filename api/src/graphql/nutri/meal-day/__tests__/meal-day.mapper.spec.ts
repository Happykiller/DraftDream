import { describe, expect, it } from '@jest/globals';
import { mapMealDayUsecaseToGql } from '../meal-day.mapper';

import { MealDayVisibility } from '@src/graphql/nutri/meal-day/meal-day.gql.types';
import type { MealDayUsecaseModel } from '@usecases/meal-day/meal-day.usecase.model';

describe('mapMealDayUsecaseToGql', () => {
  it('clones identifiers arrays to avoid shared references', () => {
    const createdAt = new Date('2023-03-01T00:00:00.000Z');
    const updatedAt = new Date('2023-03-02T00:00:00.000Z');
    const mealIds = ['meal-1', 'meal-2'];

    const model: MealDayUsecaseModel = {
      id: 'meal-day-1',
      slug: 'day-1',
      locale: 'fr-FR',
      label: 'Jour 1',
      description: 'Meals for the first day',
      mealIds,
      visibility: 'public',
      createdBy: 'coach-3',
      createdAt,
      updatedAt,
    };

    const result = mapMealDayUsecaseToGql(model);

    expect(result).toEqual({
      id: 'meal-day-1',
      slug: 'day-1',
      locale: 'fr-FR',
      label: 'Jour 1',
      description: 'Meals for the first day',
      mealIds: ['meal-1', 'meal-2'],
      visibility: MealDayVisibility.PUBLIC,
      createdBy: 'coach-3',
      createdAt,
      updatedAt,
    });
    expect(result.mealIds).not.toBe(mealIds);
  });
});
