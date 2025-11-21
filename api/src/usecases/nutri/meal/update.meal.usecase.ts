// src/usecases/meal/update.meal.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
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
      const toUpdate: any = { ...dto };
      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'meal' });
      }
      const updated = await this.inversify.bddService.meal.update(dto.id, toUpdate);
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateMealUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_MEAL_USECASE);
    }
  }
}
