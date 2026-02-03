// src/usecases/athlete/coach-athlete/list.coach-athletes.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { UserType } from '@services/db/dtos/user.dto';

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
      const athleteIds = await this.resolveAthleteIds(filters.q);
      if (filters.q?.trim() && athleteIds.length === 0) {
        return {
          items: [],
          total: 0,
          page: filters.page ?? 1,
          limit: filters.limit ?? 20,
        };
      }

      const result = await this.inversify.bddService.coachAthlete.list({
        coachId: isCoach ? session.userId : filters.coachId,
        athleteId: filters.athleteId,
        athleteIds,
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

  private async resolveAthleteIds(search?: string): Promise<string[]> {
    const q = search?.trim();
    if (!q) {
      return [];
    }

    const ids = new Set<string>();
    const pageSize = 50;
    let page = 1;

    while (true) {
      const res = await this.inversify.bddService.user.listUsers({
        q,
        type: UserType.ATHLETE,
        limit: pageSize,
        page,
      });

      (res.items ?? []).forEach((user) => {
        if (user?.id) {
          ids.add(String(user.id));
        }
      });

      if ((res.items?.length ?? 0) < pageSize || ids.size >= (res.total ?? ids.size)) {
        break;
      }

      page += 1;
    }

    return Array.from(ids);
  }
}
