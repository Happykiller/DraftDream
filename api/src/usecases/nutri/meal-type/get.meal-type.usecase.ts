// src/usecases/meal-type/get.meal-type.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MealTypeUsecaseModel } from '@src/usecases/nutri/meal-type/meal-type.usecase.model';
import { GetMealTypeUsecaseDto } from '@src/usecases/nutri/meal-type/meal-type.usecase.dto';

/**
 * Retrieves a meal type by identifier.
 */
export class GetMealTypeUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Executes the lookup and returns the matching meal type if found.
   */
  async execute(dto: GetMealTypeUsecaseDto): Promise<MealTypeUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.mealType.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`GetMealTypeUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_MEAL_TYPE_USECASE);
    }
  }
}
