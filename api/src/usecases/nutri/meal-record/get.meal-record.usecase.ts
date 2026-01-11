// src/usecases/nutri/meal-record/get.meal-record.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapMealRecordToUsecase } from '@src/usecases/nutri/meal-record/meal-record.mapper';

import { GetMealRecordUsecaseDto } from './meal-record.usecase.dto';
import { MealRecordUsecaseModel } from './meal-record.usecase.model';

/**
 * Retrieves a meal record while enforcing ownership rules.
 */
export class GetMealRecordUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Returns the record if the requester has access.
   */
  async execute(dto: GetMealRecordUsecaseDto): Promise<MealRecordUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const record = await this.inversify.bddService.mealRecord.get(payload);
      if (!record) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isCoach = session.role === Role.COACH;
      const isOwner = record.userId === session.userId;
      if (!isAdmin && !isCoach && !isOwner) {
        throw new Error(ERRORS.FORBIDDEN);
      }

      return mapMealRecordToUsecase(record);
    } catch (error: any) {
      this.inversify.loggerService.error(
        `GetMealRecordUsecase#execute (recordId: ${dto.id}) => ${error?.message ?? error}`,
      );
      throw normalizeError(error, ERRORS.GET_MEAL_RECORD_USECASE);
    }
  }
}
