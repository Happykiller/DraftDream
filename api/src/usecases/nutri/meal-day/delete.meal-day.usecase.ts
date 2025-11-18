// src/usecases/meal-day/delete.meal-day.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { DeleteMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';

export class DeleteMealDayUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteMealDayUsecaseDto): Promise<boolean> {
    try {
      const { session, id } = dto;
      const existing = await this.inversify.bddService.mealDay.get({ id });
      if (!existing) {
        return false;
      }

      const creatorId = existing.createdBy;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.DELETE_MEAL_DAY_FORBIDDEN);
      }

      return await this.inversify.bddService.mealDay.delete(id);
    } catch (error: any) {
      if (error?.message === ERRORS.DELETE_MEAL_DAY_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`DeleteMealDayUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_MEAL_DAY_USECASE);
    }
  }
}

