// src/services/graphql/mealPlans.service.ts
import type { MealPlan } from '@hooks/nutrition/useMealPlans';

import inversify from '@src/commons/inversify';

import { GraphqlServiceFetch } from './graphql.service.fetch';

const MEAL_PLAN_GET_Q = `
  query GetMealPlan($id: ID!) {
    mealPlan_get(id: $id) {
      id
      slug
      locale
      label
      description
      calories
      proteinGrams
      carbGrams
      fatGrams
      days {
        id
        templateMealDayId
        slug
        locale
        label
        description
        meals {
          id
          templateMealId
          slug
          locale
          label
          description
          foods
          calories
          proteinGrams
          carbGrams
          fatGrams
          type {
            id
            templateMealTypeId
            slug
            locale
            label
            visibility
          }
        }
      }
      userId
      athlete {
        id
        email
        first_name
        last_name
      }
      createdBy
      createdAt
      updatedAt
      creator {
        id
        email
        first_name
        last_name
      }
    }
  }
`;

type MealPlanGetPayload = {
  mealPlan_get: MealPlan | null;
};

interface MealPlanGetOptions {
  mealPlanId: string;
}

/**
 * Loads a single meal plan entity by identifier using the shared GraphQL transport.
 */
export async function mealPlanGet({ mealPlanId }: MealPlanGetOptions): Promise<MealPlan | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<MealPlanGetPayload>({
    query: MEAL_PLAN_GET_Q,
    operationName: 'GetMealPlan',
    variables: { id: mealPlanId },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.mealPlan_get ?? null;
}
