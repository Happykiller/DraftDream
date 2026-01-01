// src/usecases/nutri/meal-record/update.meal-record.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapMealRecordToUsecase } from '@src/usecases/nutri/meal-record/meal-record.mapper';

import { UpdateMealRecordUsecaseDto } from './meal-record.usecase.dto';
import { MealRecordUsecaseModel } from './meal-record.usecase.model';

/**
 * Updates the state of a meal record.
 */
export class UpdateMealRecordUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Persists state changes when authorized.
   */
  async execute(dto: UpdateMealRecordUsecaseDto): Promise<MealRecordUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const record = await this.inversify.bddService.mealRecord.get({ id: payload.id });
      if (!record) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isCreator = record.createdBy === session.userId;
      if (!isAdmin && !isCreator) {
        return null;
      }

      const updated = await this.inversify.bddService.mealRecord.update(payload.id, {
        state: payload.state,
      });

      return updated ? mapMealRecordToUsecase(updated) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateMealRecordUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_MEAL_RECORD_USECASE);
    }
  }
}
