// src/usecases/meal-day/create.meal-day.usecase.ts

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { mapMealDayToUsecase } from '@src/usecases/nutri/meal-day/meal-day.mapper';
import { CreateMealDayUsecaseDto } from '@src/usecases/nutri/meal-day/meal-day.usecase.dto';
import type { MealDayUsecaseModel } from '@src/usecases/nutri/meal-day/meal-day.usecase.model';

export class CreateMealDayUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: CreateMealDayUsecaseDto): Promise<MealDayUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'meal-day' });
      const created = await this.inversify.bddService.mealDay.create({
        ...dto,
        slug,
      });
      return created ? mapMealDayToUsecase(created) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateMealDayUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_MEAL_DAY_USECASE);
    }
  }
}

