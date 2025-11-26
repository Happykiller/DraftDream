// src/usecases/meal/create.meal.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { MealUsecaseModel } from '@src/usecases/nutri/meal/meal.usecase.model';
import { CreateMealUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';

/** Handles meal creation orchestration. */
export class CreateMealUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Executes the creation flow and returns the persisted model when successful.
   */
  async execute(dto: CreateMealUsecaseDto): Promise<MealUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'meal' });
      const created = await this.inversify.bddService.meal.create({
        slug,
        locale: dto.locale,
        label: dto.label,
        typeId: dto.typeId,
        foods: dto.foods,
        calories: dto.calories,
        proteinGrams: dto.proteinGrams,
        carbGrams: dto.carbGrams,
        fatGrams: dto.fatGrams,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateMealUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_MEAL_USECASE);
    }
  }
}
