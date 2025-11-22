// src/usecases/meal-plan/update.meal-plan.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { mapMealPlanToUsecase } from '@src/usecases/nutri/meal-plan/meal-plan.mapper';
import { UpdateMealPlanUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import type { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

export class UpdateMealPlanUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(id: string, dto: UpdateMealPlanUsecaseDto): Promise<MealPlanUsecaseModel | null> {
    try {
      const toUpdate: any = { ...dto };
      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'meal-plan' });
      }
      if (dto.days) {
        toUpdate.days = dto.days.map((day) => ({
          ...day,
          slug: buildSlug({ label: day.label, fallback: 'meal-day' }),
          meals: day.meals.map((meal) => ({
            ...meal,
            slug: buildSlug({ label: meal.label, fallback: 'meal' }),
          })),
        }));
      }
      const updated = await this.inversify.bddService.mealPlan.update(id, toUpdate);
      return updated ? mapMealPlanToUsecase(updated) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateMealPlanUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_MEAL_PLAN_USECASE);
    }
  }
}
