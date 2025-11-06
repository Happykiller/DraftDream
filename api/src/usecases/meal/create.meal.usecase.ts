// src/usecases/meal/create.meal.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { MealUsecaseModel } from '@usecases/meal/meal.usecase.model';
import { CreateMealUsecaseDto } from '@usecases/meal/meal.usecase.dto';

/** Handles meal creation orchestration. */
export class CreateMealUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Executes the creation flow and returns the persisted model when successful.
   */
  async execute(dto: CreateMealUsecaseDto): Promise<MealUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.meal.create({
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
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateMealUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_MEAL_USECASE);
    }
  }
}
