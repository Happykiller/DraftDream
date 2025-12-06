// src/usecases/athlete/athlete-info/get.athlete-info.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

import { AthleteInfoUsecaseModel } from './athlete-info.usecase.model';
import { GetAthleteInfoUsecaseDto } from './athlete-info.usecase.dto';

export class GetAthleteInfoUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetAthleteInfoUsecaseDto): Promise<AthleteInfoUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const found = await this.inversify.bddService.athleteInfo.get({ id: payload.id });
      if (!found) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      if (!isAdmin && found.createdBy !== session.userId) {
        return null;
      }

      return { ...found };
    } catch (error: any) {
      this.inversify.loggerService.error(`GetAthleteInfoUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_ATHLETE_INFO_USECASE);
    }
  }
}
