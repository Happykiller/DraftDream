// src/usecases/nutri/meal-record/delete.meal-record.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

import { DeleteMealRecordUsecaseDto } from './meal-record.usecase.dto';

/**
 * Soft deletes a meal record.
 */
export class DeleteMealRecordUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Returns true when the record is deleted.
   */
  async execute(dto: DeleteMealRecordUsecaseDto): Promise<boolean> {
    try {
      const { id, session } = dto;
      const record = await this.inversify.bddService.mealRecord.get({ id });
      if (!record) {
        return false;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isCreator = record.createdBy === session.userId;
      if (!isAdmin && !isCreator) {
        return false;
      }

      return this.inversify.bddService.mealRecord.softDelete(id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteMealRecordUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.DELETE_MEAL_RECORD_USECASE);
    }
  }
}
