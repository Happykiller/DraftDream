// src/usecases/meal/list.meal.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MealUsecaseModel } from '@src/usecases/nutri/meal/meal.usecase.model';
import { ListMealsUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';

export interface ListMealsUsecaseResult {
  items: MealUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

/** Lists meals using repository filters. */
export class ListMealsUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Executes the list query with provided filters and pagination options.
   */
  async execute(dto: ListMealsUsecaseDto = {}): Promise<ListMealsUsecaseResult> {
    try {
      const res = await this.inversify.bddService.meal.list(dto);
      return {
        items: res.items.map((item) => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListMealsUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_MEALS_USECASE);
    }
  }
}
