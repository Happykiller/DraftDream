// src/usecases/athlete/coach-athlete/get.coach-athlete.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { CoachAthleteUsecaseModel } from './coach-athlete.usecase.model';
import { GetCoachAthleteUsecaseDto } from './coach-athlete.usecase.dto';

/**
 * Use case responsible for retrieving a specific link.
 */
export class GetCoachAthleteUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Fetches a link by id.
   */
  async execute(dto: GetCoachAthleteUsecaseDto): Promise<CoachAthleteUsecaseModel | null> {
    try {
      const found = await this.inversify.bddService.coachAthlete.get({ id: dto.id });
      return found ? { ...found } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`GetCoachAthleteUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.GET_COACH_ATHLETE_USECASE);
    }
  }
}
