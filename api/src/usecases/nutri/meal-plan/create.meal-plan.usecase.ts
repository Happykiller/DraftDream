// src/usecases/meal-plan/create.meal-plan.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { mapMealPlanToUsecase } from '@src/usecases/nutri/meal-plan/meal-plan.mapper';
import { CreateMealPlanUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import type { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

export class CreateMealPlanUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateMealPlanUsecaseDto): Promise<MealPlanUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'meal-plan' });
      const days = dto.days.map((day) => ({
        ...day,
        slug: buildSlug({ label: day.label, fallback: 'meal-day' }),
        meals: day.meals.map((meal) => ({
          ...meal,
          slug: buildSlug({ label: meal.label, fallback: 'meal' }),
        })),
      }));
      const created = await this.inversify.bddService.mealPlan.create({
        ...dto,
        slug,
        days,
      });
      return created ? mapMealPlanToUsecase(created) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateMealPlanUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_MEAL_PLAN_USECASE);
    }
  }
}
