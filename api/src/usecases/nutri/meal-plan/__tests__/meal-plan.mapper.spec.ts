import { describe, expect, it } from '@jest/globals';
import { mapMealPlanToUsecase } from '../meal-plan.mapper';

import type { MealPlan } from '@services/db/models/meal-plan.model';

describe('mapMealPlanToUsecase', () => {
  it('maps nested meal plan snapshots to the use case model', () => {
    const createdAt = new Date('2024-12-01T12:00:00.000Z');
    const updatedAt = new Date('2024-12-02T12:00:00.000Z');
    const startDate = new Date('2024-12-03T00:00:00.000Z');
    const endDate = new Date('2025-01-15T00:00:00.000Z');

    const plan: MealPlan = {
      id: 'meal-plan-1',
      slug: 'cutting',
      locale: 'fr-FR',
      label: 'Sèche',
      description: 'Meal plan for cutting phase',
      visibility: 'PUBLIC',
      startDate,
      endDate,
      calories: 2200,
      proteinGrams: 180,
      carbGrams: 200,
      fatGrams: 70,
      days: [
        {
          id: 'day-1',
          templateMealDayId: 'template-day-1',
          slug: 'jour-1',
          locale: 'fr-FR',
          label: 'Jour 1',
          description: 'Meals for day 1',
          meals: [
            {
              id: 'meal-1',
              templateMealId: 'template-meal-1',
              slug: 'breakfast',
              locale: 'fr-FR',
              label: 'Petit déjeuner',
              description: 'Omelette and oats',
              foods: 'Omelette, oats, berries',
              calories: 600,
              proteinGrams: 40,
              carbGrams: 60,
              fatGrams: 20,
              type: {
                id: 'type-1',
                templateMealTypeId: 'template-type-1',
                slug: 'morning',
                locale: 'fr-FR',
                label: 'Matin',
                visibility: 'PUBLIC',
              },
            },
          ],
        },
      ],
      userId: 'athlete-1',
      createdBy: 'coach-55',
      deletedAt: undefined,
      createdAt,
      updatedAt,
    };

    const result = mapMealPlanToUsecase(plan);

    expect(result).toEqual({
      id: 'meal-plan-1',
      slug: 'cutting',
      locale: 'fr-FR',
      label: 'Sèche',
      description: 'Meal plan for cutting phase',
      visibility: 'PUBLIC',
      startDate,
      endDate,
      calories: 2200,
      proteinGrams: 180,
      carbGrams: 200,
      fatGrams: 70,
      days: [
        {
          id: 'day-1',
          templateMealDayId: 'template-day-1',
          slug: 'jour-1',
          locale: 'fr-FR',
          label: 'Jour 1',
          description: 'Meals for day 1',
          meals: [
            {
              id: 'meal-1',
              templateMealId: 'template-meal-1',
              slug: 'breakfast',
              locale: 'fr-FR',
              label: 'Petit déjeuner',
              description: 'Omelette and oats',
              foods: 'Omelette, oats, berries',
              calories: 600,
              proteinGrams: 40,
              carbGrams: 60,
              fatGrams: 20,
              type: {
                id: 'type-1',
                templateMealTypeId: 'template-type-1',
                slug: 'morning',
                locale: 'fr-FR',
                label: 'Matin',
                visibility: 'PUBLIC',
              },
            },
          ],
        },
      ],
      userId: 'athlete-1',
      createdBy: 'coach-55',
      deletedAt: undefined,
      createdAt,
      updatedAt,
    });

    expect(result.days).not.toBe(plan.days);
    expect(result.days[0].meals).not.toBe(plan.days[0].meals);
  });
});
