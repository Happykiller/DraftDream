// src/usecases/meal-day/list.meal-days.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapMealDayToUsecase } from '@usecases/meal-day/meal-day.mapper';
import { ListMealDaysUsecaseDto } from '@usecases/meal-day/meal-day.usecase.dto';
import type { MealDayUsecaseModel } from '@usecases/meal-day/meal-day.usecase.model';

export class ListMealDaysUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListMealDaysUsecaseDto): Promise<{
    items: MealDayUsecaseModel[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { session, ...payload } = dto;

      if (session.role === Role.ADMIN) {
        const res = await this.inversify.bddService.mealDay.list(payload);
        return {
          items: res.items.map(mapMealDayToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      if (session.role === Role.COACH) {
        const { createdBy, createdByIn, ...rest } = payload;

        if (createdByIn?.length) {
          throw new Error(ERRORS.LIST_MEAL_DAYS_FORBIDDEN);
        }

        if (createdBy) {
          if (createdBy === session.userId) {
            const res = await this.inversify.bddService.mealDay.list({
              ...rest,
              createdBy,
            });
            return {
              items: res.items.map(mapMealDayToUsecase),
              total: res.total,
              page: res.page,
              limit: res.limit,
            };
          }

          const allowedCreatorIds = await this.resolveAccessibleCreatorIds(session.userId);
          if (!allowedCreatorIds.has(createdBy)) {
            throw new Error(ERRORS.LIST_MEAL_DAYS_FORBIDDEN);
          }

          const res = await this.inversify.bddService.mealDay.list({
            ...rest,
            createdBy,
            visibility: 'public',
          });
          return {
            items: res.items.map(mapMealDayToUsecase),
            total: res.total,
            page: res.page,
            limit: res.limit,
          };
        }

        const allowedCreatorIds = await this.resolveAccessibleCreatorIds(session.userId);
        const additionalCreators = Array.from(allowedCreatorIds).filter((id) => id !== session.userId);
        const res = await this.inversify.bddService.mealDay.list({
          ...rest,
          accessibleFor: { ownerId: session.userId, includeCreatorIds: additionalCreators },
        });
        return {
          items: res.items.map(mapMealDayToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      throw new Error(ERRORS.LIST_MEAL_DAYS_FORBIDDEN);
    } catch (error: any) {
      if (error?.message === ERRORS.LIST_MEAL_DAYS_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`ListMealDaysUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_MEAL_DAYS_USECASE);
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

