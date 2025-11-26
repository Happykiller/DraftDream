// src/usecases/meal-day/update.meal-day.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';
import { UpdateMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import type { MealDayUsecaseModel } from '@src/usecases/nutri/meal-day/meal-day.usecase.model';

export class UpdateMealDayUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateMealDayUsecaseDto): Promise<MealDayUsecaseModel | null> {
    try {
      const toUpdate: any = { ...dto };
      if (dto.label) {
        toUpdate.slug = buildSlug({ label: dto.label, fallback: 'meal-day' });
      }
      const updated = await this.inversify.bddService.mealDay.update(dto.id, toUpdate);
      return updated ? mapMealDayToUsecase(updated) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateMealDayUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_MEAL_DAY_USECASE);
    }
  }
}

