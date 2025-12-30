// src/usecases/nutri/meal-record/list.meal-records.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapMealRecordToUsecase } from '@src/usecases/nutri/meal-record/meal-record.mapper';

import { ListMealRecordsUsecaseDto } from './meal-record.usecase.dto';
import { MealRecordUsecaseModel } from './meal-record.usecase.model';

interface ListMealRecordsResult {
  items: MealRecordUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Lists meal records with session-based filtering.
 */
export class ListMealRecordsUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Applies ownership constraints and returns paginated results.
   */
  async execute(dto: ListMealRecordsUsecaseDto): Promise<ListMealRecordsResult> {
    try {
      const { session, ...filters } = dto;
      const isAdmin = session.role === Role.ADMIN;

      const result = await this.inversify.bddService.mealRecord.list({
        userId: isAdmin ? filters.userId : session.userId,
        mealPlanId: filters.mealPlanId,
        mealDayId: filters.mealDayId,
        mealId: filters.mealId,
        state: filters.state,
        includeArchived: isAdmin ? filters.includeArchived : false,
        limit: filters.limit,
        page: filters.page,
      });

      return {
        items: result.items.map(mapMealRecordToUsecase),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListMealRecordsUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_MEAL_RECORDS_USECASE);
    }
  }
}
