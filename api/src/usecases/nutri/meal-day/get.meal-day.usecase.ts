// src/usecases/meal-day/get.meal-day.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';
import { GetMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import type { MealDayUsecaseModel } from '@src/usecases/nutri/meal-day/meal-day.usecase.model';
import { enumEquals } from '@src/common/enum.util';

export class GetMealDayUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetMealDayUsecaseDto): Promise<MealDayUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      void session;
      const mealDay = await this.inversify.bddService.mealDay.get(payload);
      if (!mealDay) {
        return null;
      }

      if (session.role === Role.ADMIN || mealDay.createdBy === session.userId || enumEquals(mealDay.visibility, 'PUBLIC')) {
        return mapMealDayToUsecase(mealDay);
      }

      throw new Error(ERRORS.GET_MEAL_DAY_FORBIDDEN);
    } catch (error: any) {
      if (error?.message === ERRORS.GET_MEAL_DAY_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`GetMealDayUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_MEAL_DAY_USECASE);
    }
  }
}

