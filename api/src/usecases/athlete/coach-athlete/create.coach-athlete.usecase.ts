// src/usecases/athlete/coach-athlete/create.coach-athlete.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { CoachAthleteUsecaseModel } from './coach-athlete.usecase.model';
import { CreateCoachAthleteUsecaseDto } from './coach-athlete.usecase.dto';

/**
 * Use case responsible for creating coach-athlete links.
 */
export class CreateCoachAthleteUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Persists a new link and returns it.
   */
  async execute(dto: CreateCoachAthleteUsecaseDto): Promise<CoachAthleteUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.coachAthlete.create({
        coachId: dto.coachId,
        athleteId: dto.athleteId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        is_active: dto.is_active,
        note: dto.note,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateCoachAthleteUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_COACH_ATHLETE_USECASE);
    }
  }
}
