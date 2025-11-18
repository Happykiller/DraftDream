// src/usecases/athlete/coach-athlete/update.coach-athlete.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { CoachAthleteUsecaseModel } from './coach-athlete.usecase.model';
import { UpdateCoachAthleteUsecaseDto } from './coach-athlete.usecase.dto';

/**
 * Use case responsible for updating coach-athlete links.
 */
export class UpdateCoachAthleteUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Applies the provided patch to the stored link.
   */
  async execute(dto: UpdateCoachAthleteUsecaseDto): Promise<CoachAthleteUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.coachAthlete.update(dto.id, {
        coachId: dto.coachId,
        athleteId: dto.athleteId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        is_active: dto.is_active,
        note: dto.note,
      });
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateCoachAthleteUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_COACH_ATHLETE_USECASE);
    }
  }
}
