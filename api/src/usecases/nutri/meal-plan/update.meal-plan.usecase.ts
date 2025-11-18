// src/usecases/meal-plan/update.meal-plan.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapMealPlanToUsecase } from '@src/usecases/nutri/meal-plan/meal-plan.mapper';
import { UpdateMealPlanUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import type { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

export class UpdateMealPlanUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(id: string, dto: UpdateMealPlanUsecaseDto): Promise<MealPlanUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.mealPlan.update(id, dto);
      return updated ? mapMealPlanToUsecase(updated) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateMealPlanUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_MEAL_PLAN_USECASE);
    }
  }
}
