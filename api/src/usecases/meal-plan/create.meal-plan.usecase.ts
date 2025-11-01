// src/usecases/meal-plan/create.meal-plan.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapMealPlanToUsecase } from '@usecases/meal-plan/meal-plan.mapper';
import { CreateMealPlanUsecaseDto } from '@usecases/meal-plan/meal-plan.usecase.dto';
import type { MealPlanUsecaseModel } from '@usecases/meal-plan/meal-plan.usecase.model';

export class CreateMealPlanUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateMealPlanUsecaseDto): Promise<MealPlanUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.mealPlan.create(dto);
      return created ? mapMealPlanToUsecase(created) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateMealPlanUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_MEAL_PLAN_USECASE);
    }
  }
}
