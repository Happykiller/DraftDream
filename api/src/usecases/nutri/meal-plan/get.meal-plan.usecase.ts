// src/usecases/meal-plan/get.meal-plan.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapMealPlanToUsecase } from '@src/usecases/nutri/meal-plan/meal-plan.mapper';
import { GetMealPlanUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import type { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';
import { enumEquals } from '@src/common/enum.util';

export class GetMealPlanUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetMealPlanUsecaseDto): Promise<MealPlanUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const mealPlan = await this.inversify.bddService.mealPlan.get(payload);
      if (!mealPlan) {
        return null;
      }

      const creatorId = mealPlan.createdBy;
      const assigneeId = mealPlan.userId;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;
      const isCoach = session.role === Role.COACH;
      const isPublic = isCoach
        ? enumEquals(mealPlan.visibility, 'PUBLIC') ?? (await this.isPublicMealPlan(creatorId))
        : false;
      const isAssignedAthlete = session.role === Role.ATHLETE && assigneeId === session.userId;

      if (!isAdmin && !isCreator && !(isCoach && isPublic) && !isAssignedAthlete) {
        throw new Error(ERRORS.GET_MEAL_PLAN_FORBIDDEN);
      }

      return mapMealPlanToUsecase(mealPlan);
    } catch (error: any) {
      if (error?.message === ERRORS.GET_MEAL_PLAN_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`GetMealPlanUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_MEAL_PLAN_USECASE);
    }
  }

  private async isPublicMealPlan(creatorId?: string | null): Promise<boolean> {
    if (!creatorId) {
      return false;
    }

    try {
      const user = await this.inversify.bddService.user.getUser({ id: creatorId });
      return user?.type === 'admin';
    } catch (error) {
      this.inversify.loggerService.warn?.(
        `GetMealPlanUsecase#isPublicMealPlan => ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
