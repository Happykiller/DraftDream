// src/usecases/meal-day/create.meal-day.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';
import { CreateMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import type { MealDayUsecaseModel } from '@src/usecases/nutri/meal-day/meal-day.usecase.model';

export class CreateMealDayUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateMealDayUsecaseDto): Promise<MealDayUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.mealDay.create(dto);
      return created ? mapMealDayToUsecase(created) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateMealDayUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_MEAL_DAY_USECASE);
    }
  }
}

