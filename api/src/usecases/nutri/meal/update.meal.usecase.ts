// src/usecases/meal/update.meal.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MealUsecaseModel } from '@src/usecases/nutri/meal/meal.usecase.model';
import { UpdateMealUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';

/** Applies mutations to an existing meal. */
export class UpdateMealUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Updates the target meal and returns the persisted version when successful.
   */
  async execute(dto: UpdateMealUsecaseDto): Promise<MealUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.meal.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        typeId: dto.typeId,
        foods: dto.foods,
        calories: dto.calories,
        proteinGrams: dto.proteinGrams,
        carbGrams: dto.carbGrams,
        fatGrams: dto.fatGrams,
        visibility: dto.visibility,
      });
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateMealUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_MEAL_USECASE);
    }
  }
}
