// src/usecases/athlete/coach-athlete/list.coach-athletes.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

import { CoachAthleteUsecaseModel } from './coach-athlete.usecase.model';
import { ListCoachAthletesUsecaseDto } from './coach-athlete.usecase.dto';

interface ListCoachAthletesResult {
  items: CoachAthleteUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Use case responsible for listing coach-athlete links.
 */
export class ListCoachAthletesUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Returns paginated links matching the provided filters.
   */
  async execute(dto: ListCoachAthletesUsecaseDto = {}): Promise<ListCoachAthletesResult> {
    try {
      const result = await this.inversify.bddService.coachAthlete.list({
        coachId: dto.coachId,
        athleteId: dto.athleteId,
        is_active: dto.is_active,
        createdBy: dto.createdBy,
        limit: dto.limit,
        page: dto.page,
      });
      return {
        items: result.items.map((item) => ({ ...item })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListCoachAthletesUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.LIST_COACH_ATHLETES_USECASE);
    }
  }
}
