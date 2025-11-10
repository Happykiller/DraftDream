// src/usecases/meal-type/update.meal-type.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MealTypeUsecaseModel } from '@usecases/meal-type/meal-type.usecase.model';
import { UpdateMealTypeUsecaseDto } from '@usecases/meal-type/meal-type.usecase.dto';

/**
 * Updates a meal type with the provided patch.
 */
export class UpdateMealTypeUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Executes the update and returns the refreshed meal type when it exists.
   */
  async execute(dto: UpdateMealTypeUsecaseDto): Promise<MealTypeUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.mealType.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        icon: dto.icon,
        visibility: dto.visibility,
      });
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateMealTypeUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_MEAL_TYPE_USECASE);
    }
  }
}
