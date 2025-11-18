// src/usecases/meal/delete.meal.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteMealUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';

/** Permanently deletes a meal. */
export class DeleteMealUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Returns true when the meal has been deleted.
   */
  async execute(dto: DeleteMealUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.meal.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteMealUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_MEAL_USECASE);
    }
  }
}
