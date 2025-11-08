import { mapMealPlanUsecaseToGql } from '../meal-plan.mapper';

import { MealTypeVisibility } from '@graphql/meal-type/meal-type.gql.types';
import type { MealPlanUsecaseModel } from '@usecases/meal-plan/meal-plan.usecase.model';

describe('mapMealPlanUsecaseToGql', () => {
  it('normalizes nullable fields and nested snapshots', () => {
    const createdAt = new Date('2023-08-01T00:00:00.000Z');
    const updatedAt = new Date('2023-08-02T00:00:00.000Z');

    const model: MealPlanUsecaseModel = {
      id: 'meal-plan-1',
      slug: 'bulk',
      locale: 'fr-FR',
      label: 'Prise de masse',
      description: 'Mass gain plan',
      calories: 3000,
      proteinGrams: 200,
      carbGrams: 320,
      fatGrams: 90,
      days: [
        {
          id: 'day-1',
          templateMealDayId: undefined,
          slug: undefined,
          locale: undefined,
          label: 'Jour 1',
          description: undefined,
          meals: [
            {
              id: 'meal-1',
              templateMealId: undefined,
              slug: undefined,
              locale: undefined,
              label: 'Petit déjeuner',
              description: undefined,
              foods: 'Omelette',
              calories: 700,
              proteinGrams: 45,
              carbGrams: 60,
              fatGrams: 25,
              type: {
                id: undefined,
                templateMealTypeId: undefined,
                slug: undefined,
                locale: undefined,
                label: 'Matin',
                visibility: 'private',
              },
            },
          ],
        },
      ],
      userId: undefined,
      createdBy: 'coach-8',
      createdAt,
      updatedAt,
    };

    const result = mapMealPlanUsecaseToGql(model);

    expect(result).toEqual({
      id: 'meal-plan-1',
      slug: 'bulk',
      locale: 'fr-FR',
      label: 'Prise de masse',
      description: 'Mass gain plan',
      calories: 3000,
      proteinGrams: 200,
      carbGrams: 320,
      fatGrams: 90,
      days: [
        {
          id: 'day-1',
          templateMealDayId: null,
          slug: null,
          locale: null,
          label: 'Jour 1',
          description: null,
          meals: [
            {
              id: 'meal-1',
              templateMealId: null,
              slug: null,
              locale: null,
              label: 'Petit déjeuner',
              description: null,
              foods: 'Omelette',
              calories: 700,
              proteinGrams: 45,
              carbGrams: 60,
              fatGrams: 25,
              type: {
                id: null,
                templateMealTypeId: null,
                slug: null,
                locale: null,
                label: 'Matin',
                visibility: MealTypeVisibility.PRIVATE,
              },
            },
          ],
        },
      ],
      userId: null,
      createdBy: 'coach-8',
      createdAt,
      updatedAt,
      creator: null,
      athlete: null,
    });
  });
});
