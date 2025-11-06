// src/usecases/meal-plan/delete.meal-plan.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { DeleteMealPlanUsecaseDto } from '@usecases/meal-plan/meal-plan.usecase.dto';

export class DeleteMealPlanUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: DeleteMealPlanUsecaseDto): Promise<boolean> {
    try {
      const { session, id } = dto;
      const mealPlan = await this.inversify.bddService.mealPlan.get({ id });
      if (!mealPlan) {
        return false;
      }

      const creatorId = mealPlan.createdBy;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.DELETE_MEAL_PLAN_FORBIDDEN);
      }

      return await this.inversify.bddService.mealPlan.delete(id);
    } catch (error: any) {
      if (error?.message === ERRORS.DELETE_MEAL_PLAN_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`DeleteMealPlanUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_MEAL_PLAN_USECASE);
    }
  }
}
