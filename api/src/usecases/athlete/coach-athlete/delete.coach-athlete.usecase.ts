// src/usecases/athlete/coach-athlete/delete.coach-athlete.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { DeleteCoachAthleteUsecaseDto } from './coach-athlete.usecase.dto';

/**
 * Use case responsible for removing coach-athlete links.
 */
export class DeleteCoachAthleteUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Deletes a link and returns whether the operation succeeded.
   */
  async execute(dto: DeleteCoachAthleteUsecaseDto): Promise<boolean> {
    try {
      return this.inversify.bddService.coachAthlete.delete(dto.id);
    } catch (error: any) {
      this.inversify.loggerService.error(`DeleteCoachAthleteUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.DELETE_COACH_ATHLETE_USECASE);
    }
  }
}
