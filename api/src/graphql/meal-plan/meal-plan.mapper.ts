// src/graphql/meal-plan/meal-plan.mapper.ts
import {
  MealPlanGql,
  MealPlanDaySnapshotGql,
  MealPlanMealSnapshotGql,
  MealPlanMealTypeSnapshotGql,
} from '@graphql/meal-plan/meal-plan.gql.types';
import { MealTypeVisibility } from '@graphql/meal-type/meal-type.gql.types';
import {
  MealPlanDayUsecaseModel,
  MealPlanMealTypeUsecaseModel,
  MealPlanMealUsecaseModel,
  MealPlanUsecaseModel,
} from '@usecases/meal-plan/meal-plan.usecase.model';

const mapMealType = (type: MealPlanMealTypeUsecaseModel): MealPlanMealTypeSnapshotGql => ({
  id: type.id ?? null,
  templateMealTypeId: type.templateMealTypeId ?? null,
  slug: type.slug ?? null,
  locale: type.locale ?? null,
  label: type.label,
  visibility: normalizeVisibility(type.visibility),
});

const mapMeal = (meal: MealPlanMealUsecaseModel): MealPlanMealSnapshotGql => ({
  id: meal.id,
  templateMealId: meal.templateMealId ?? null,
  slug: meal.slug ?? null,
  locale: meal.locale ?? null,
  label: meal.label,
  description: meal.description ?? null,
  foods: meal.foods,
  calories: meal.calories,
  proteinGrams: meal.proteinGrams,
  carbGrams: meal.carbGrams,
  fatGrams: meal.fatGrams,
  type: mapMealType(meal.type),
});

const mapDay = (day: MealPlanDayUsecaseModel): MealPlanDaySnapshotGql => ({
  id: day.id,
  templateMealDayId: day.templateMealDayId ?? null,
  slug: day.slug ?? null,
  locale: day.locale ?? null,
  label: day.label,
  description: day.description ?? null,
  meals: (day.meals ?? []).map(mapMeal),
});

export function mapMealPlanUsecaseToGql(model: MealPlanUsecaseModel): MealPlanGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    description: model.description ?? null,
    calories: model.calories,
    proteinGrams: model.proteinGrams,
    carbGrams: model.carbGrams,
    fatGrams: model.fatGrams,
    days: (model.days ?? []).map(mapDay),
    userId: model.userId ?? null,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    creator: null,
    athlete: null,
  };
}

function normalizeVisibility(
  visibility?: MealPlanMealTypeUsecaseModel['visibility'],
): MealTypeVisibility | null {
  if (!visibility) {
    return null;
  }
  return visibility === 'public' ? MealTypeVisibility.PUBLIC : MealTypeVisibility.PRIVATE;
}
