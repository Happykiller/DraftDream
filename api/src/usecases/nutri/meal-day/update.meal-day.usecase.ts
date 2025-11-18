// src/usecases/meal-day/update.meal-day.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';
import { UpdateMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import type { MealDayUsecaseModel } from '@src/usecases/nutri/meal-day/meal-day.usecase.model';

export class UpdateMealDayUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(id: string, dto: UpdateMealDayUsecaseDto): Promise<MealDayUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.mealDay.update(id, dto);
      return updated ? mapMealDayToUsecase(updated) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateMealDayUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_MEAL_DAY_USECASE);
    }
  }
}

