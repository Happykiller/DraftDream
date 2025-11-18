// src/usecases/meal-plan/list.meal-plans.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapMealPlanToUsecase } from '@src/usecases/nutri/meal-plan/meal-plan.mapper';
import { ListMealPlansUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import type { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

export class ListMealPlansUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListMealPlansUsecaseDto): Promise<{
    items: MealPlanUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { session, ...payload } = dto;

      if (session.role === Role.ADMIN) {
        const res = await this.inversify.bddService.mealPlan.list(payload);
        return {
          items: res.items.map(mapMealPlanToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      if (session.role === Role.COACH) {
        const { createdBy, ...rest } = payload;
        const allowedCreatorIds = await this.resolveAccessibleCreatorIds(session.userId);

        if (createdBy) {
          if (!allowedCreatorIds.has(createdBy)) {
            throw new Error(ERRORS.LIST_MEAL_PLANS_FORBIDDEN);
          }
          const res = await this.inversify.bddService.mealPlan.list({
            ...rest,
            createdBy,
          });
          return {
            items: res.items.map(mapMealPlanToUsecase),
            total: res.total,
            page: res.page,
            limit: res.limit,
          };
        }

        const res = await this.inversify.bddService.mealPlan.list({
          ...rest,
          createdByIn: Array.from(allowedCreatorIds),
        });
        return {
          items: res.items.map(mapMealPlanToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      if (session.role === Role.ATHLETE) {
        const { createdBy, createdByIn, userId, ...rest } = payload;

        if (createdBy || (Array.isArray(createdByIn) && createdByIn.length > 0)) {
          throw new Error(ERRORS.LIST_MEAL_PLANS_FORBIDDEN);
        }

        if (userId && userId !== session.userId) {
          throw new Error(ERRORS.LIST_MEAL_PLANS_FORBIDDEN);
        }

        const res = await this.inversify.bddService.mealPlan.list({
          ...rest,
          userId: session.userId,
        });

        return {
          items: res.items.map(mapMealPlanToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      throw new Error(ERRORS.LIST_MEAL_PLANS_FORBIDDEN);
    } catch (error: any) {
      if (error?.message === ERRORS.LIST_MEAL_PLANS_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`ListMealPlansUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_MEAL_PLANS_USECASE);
    }
  }

  private async resolveAccessibleCreatorIds(userId: string): Promise<Set<string>> {
    const allowed = new Set<string>([userId]);
    const adminIds = await this.fetchAdminIds();
    for (const id of adminIds) {
      allowed.add(id);
    }
    return allowed;
  }

  private async fetchAdminIds(): Promise<Set<string>> {
    const ids = new Set<string>();
    const pageSize = 50;
    let page = 1;

    while (true) {
      const res = await this.inversify.bddService.user.listUsers({
        type: 'admin',
        limit: pageSize,
        page,
      });

      for (const user of res.items ?? []) {
        if (user?.id) {
          ids.add(String(user.id));
        }
      }

      if ((res.items?.length ?? 0) < pageSize || ids.size >= (res.total ?? ids.size)) {
        break;
      }

      page += 1;
    }

    return ids;
  }
}
