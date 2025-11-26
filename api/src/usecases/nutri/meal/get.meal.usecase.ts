// src/usecases/meal/get.meal.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { MealUsecaseModel } from '@src/usecases/nutri/meal/meal.usecase.model';
import { GetMealUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';

/** Retrieves a single meal by identifier. */
export class GetMealUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Returns the meal when found, otherwise null.
   */
  async execute(dto: GetMealUsecaseDto): Promise<MealUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.meal.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetMealUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_MEAL_USECASE);
    }
  }
}
