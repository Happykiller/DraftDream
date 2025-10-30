// src/usecases/meal-type/delete.meal-type.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteMealTypeUsecaseDto } from '@usecases/meal-type/meal-type.usecase.dto';

/**
 * Deletes a meal type.
 */
export class DeleteMealTypeUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Executes the deletion and returns true when the document is removed.
   */
  async execute(dto: DeleteMealTypeUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.mealType.delete(dto.id);
    } catch (e: any) {
      this.inversify.loggerService.error(`DeleteMealTypeUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.DELETE_MEAL_TYPE_USECASE);
    }
  }
}
