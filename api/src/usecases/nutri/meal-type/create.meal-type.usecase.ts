// src/usecases/meal-type/create.meal-type.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { MealTypeUsecaseModel } from '@src/usecases/nutri/meal-type/meal-type.usecase.model';
import { CreateMealTypeUsecaseDto } from '@src/usecases/nutri/meal-type/meal-type.usecase.dto';

/**
 * Handles meal type creation orchestration.
 */
export class CreateMealTypeUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Executes the creation flow and returns the persisted model when successful.
   */
  async execute(dto: CreateMealTypeUsecaseDto): Promise<MealTypeUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'meal-type', locale: dto.locale });
      const created = await this.inversify.bddService.mealType.create({
        slug,
        locale: dto.locale,
        label: dto.label,
        icon: dto.icon,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateMealTypeUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.CREATE_MEAL_TYPE_USECASE);
    }
  }
}
