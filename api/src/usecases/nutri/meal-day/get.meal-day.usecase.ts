// src/usecases/meal-day/get.meal-day.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';
import { GetMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import type { MealDayUsecaseModel } from '@src/usecases/nutri/meal-day/meal-day.usecase.model';

export class GetMealDayUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetMealDayUsecaseDto): Promise<MealDayUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const mealDay = await this.inversify.bddService.mealDay.get(payload);
      if (!mealDay) {
        return null;
      }

      const creatorId = mealDay.createdBy;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;
      const isCoach = session.role === Role.COACH;
      const isPublic = mealDay.visibility === 'public';

      if (!isAdmin && !isCreator && !(isCoach && isPublic)) {
        throw new Error(ERRORS.GET_MEAL_DAY_FORBIDDEN);
      }

      return mapMealDayToUsecase(mealDay);
    } catch (error: any) {
      if (error?.message === ERRORS.GET_MEAL_DAY_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`GetMealDayUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_MEAL_DAY_USECASE);
    }
  }
}

