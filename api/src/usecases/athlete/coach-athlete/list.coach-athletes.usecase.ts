// src/usecases/athlete/coach-athlete/list.coach-athletes.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
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
  constructor(private readonly inversify: Inversify) { }

  /**
   * Returns paginated links matching the provided filters.
   */
  async execute(dto: ListCoachAthletesUsecaseDto): Promise<ListCoachAthletesResult> {
    try {
      const { session, ...filters } = dto;
      const isAdmin = session.role === Role.ADMIN;
      const isCoach = session.role === Role.COACH;
      const includeArchived = isAdmin ? filters.includeArchived : false;
      const activeAt = isCoach ? new Date() : undefined;

      const result = await this.inversify.bddService.coachAthlete.list({
        coachId: isCoach ? session.userId : filters.coachId,
        athleteId: filters.athleteId,
        is_active: filters.is_active,
        createdBy: isAdmin ? filters.createdBy : undefined,
        limit: filters.limit,
        page: filters.page,
        includeArchived,
        activeAt,
      });
      return {
        items: result.items.map((item) => ({ ...item })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListCoachAthletesUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_COACH_ATHLETES_USECASE);
    }
  }
}
