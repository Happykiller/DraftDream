// src/usecases/athlete/athlete-info/hard-delete.athlete-info.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

import { HardDeleteAthleteInfoUsecaseDto } from './athlete-info.usecase.dto';

export class HardDeleteAthleteInfoUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: HardDeleteAthleteInfoUsecaseDto): Promise<boolean> {
    try {
      const { session, ...payload } = dto;
      if (session.role !== Role.ADMIN) {
        throw new Error(ERRORS.FORBIDDEN);
      }

      return await this.inversify.bddService.athleteInfo.hardDelete(payload.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`HardDeleteAthleteInfoUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.HARD_DELETE_ATHLETE_INFO_USECASE);
    }
  }
}
