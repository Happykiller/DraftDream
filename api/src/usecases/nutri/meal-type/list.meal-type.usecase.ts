// src/usecases/meal-type/list.meal-type.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MealTypeUsecaseModel } from '@src/usecases/nutri/meal-type/meal-type.usecase.model';
import { ListMealTypesUsecaseDto } from '@src/usecases/nutri/meal-type/meal-type.usecase.dto';

export interface ListMealTypesUsecaseResult {
  items: MealTypeUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Lists meal types using repository filters.
 */
export class ListMealTypesUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Executes the list query with provided filters and pagination options.
   */
  async execute(dto: ListMealTypesUsecaseDto = {}): Promise<ListMealTypesUsecaseResult> {
    try {
      const res = await this.inversify.bddService.mealType.list(dto);
      return {
        items: res.items.map((item) => ({ ...item })),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListMealTypesUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_MEAL_TYPES_USECASE);
    }
  }
}
