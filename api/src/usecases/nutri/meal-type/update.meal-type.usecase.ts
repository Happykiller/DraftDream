// src/usecases/meal-type/update.meal-type.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { MealTypeUsecaseModel } from '@src/usecases/nutri/meal-type/meal-type.usecase.model';
import { UpdateMealTypeUsecaseDto } from '@src/usecases/nutri/meal-type/meal-type.usecase.dto';

/**
 * Updates a meal type with the provided patch.
 */
export class UpdateMealTypeUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Executes the update and returns the refreshed meal type when it exists.
   */
  async execute(dto: UpdateMealTypeUsecaseDto): Promise<MealTypeUsecaseModel | null> {
    try {
      const toUpdate: any = { ...dto };
      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'meal-type', locale: dto.locale });
      }
      const updated = await this.inversify.bddService.mealType.update(dto.id, toUpdate);
      return updated ? { ...updated } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateMealTypeUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.UPDATE_MEAL_TYPE_USECASE);
    }
  }
}
