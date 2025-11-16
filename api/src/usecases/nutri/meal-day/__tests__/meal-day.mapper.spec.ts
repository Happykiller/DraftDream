import { describe, expect, it } from '@jest/globals';

import type { MealDay } from '@services/db/models/meal-day.model';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';

describe('mapMealDayToUsecase', () => {
  it('maps the persistence model to the use case format', () => {
    const createdAt = new Date('2024-11-01T00:00:00.000Z');
    const updatedAt = new Date('2024-11-02T00:00:00.000Z');

    const mealDay: MealDay = {
      id: 'meal-day-1',
      slug: 'day-1',
      locale: 'fr-FR',
      label: 'Jour 1',
      description: 'Breakfast, lunch, dinner',
      mealIds: ['meal-1', 'meal-2'],
      visibility: 'public',
      createdBy: 'coach-1',
      deletedAt: undefined,
      createdAt,
      updatedAt,
    };

    const result = mapMealDayToUsecase(mealDay);

    expect(result).toEqual({
      id: 'meal-day-1',
      slug: 'day-1',
      locale: 'fr-FR',
      label: 'Jour 1',
      description: 'Breakfast, lunch, dinner',
      mealIds: ['meal-1', 'meal-2'],
      visibility: 'public',
      createdBy: 'coach-1',
      deletedAt: undefined,
      createdAt,
      updatedAt,
    });
    expect(result.mealIds).not.toBe(mealDay.mealIds);
  });
});
