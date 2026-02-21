// src/usecases/athlete/athlete-info/list.athlete-infos.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

import { AthleteInfoUsecaseModel } from './athlete-info.usecase.model';
import { ListAthleteInfosUsecaseDto } from './athlete-info.usecase.dto';

interface ListAthleteInfosResult {
  items: AthleteInfoUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListAthleteInfosUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListAthleteInfosUsecaseDto): Promise<ListAthleteInfosResult> {
    try {
      const { session, ...filters } = dto;
      const isAdmin = session.role === Role.ADMIN;
      const isAthlete = session.role === Role.ATHLETE;
      const isCoach = session.role === Role.COACH;
      const isFilteringByUser = Boolean(filters.userId);

      const includeArchived = isAdmin ? filters.includeArchived : false;

      if (isAthlete) {
        const result = await this.inversify.bddService.athleteInfo.list({
          userId: session.userId,
          includeArchived,
          limit: filters.limit,
          page: filters.page,
        });

        return {
          items: result.items.map((item) => ({ ...item })),
          total: result.total,
          page: result.page,
          limit: result.limit,
        };
      }

      if (isCoach) {
        if (isFilteringByUser) {
          const hasLink = await this.inversify.resolveCoachAthleteVisibilityUsecase.execute({
            coachId: session.userId,
            athleteId: filters.userId!,
          });
          if (!hasLink) {
            return { items: [], total: 0, page: filters.page ?? 1, limit: filters.limit ?? 20 };
          }
        }

        const athleteIds = isFilteringByUser
          ? [filters.userId!]
          : await this.listCoachAthleteIds(session.userId);

        if (!athleteIds.length) {
          return { items: [], total: 0, page: filters.page ?? 1, limit: filters.limit ?? 20 };
        }

        const result = await this.inversify.bddService.athleteInfo.list({
          userIds: athleteIds,
          includeArchived,
          limit: filters.limit,
          page: filters.page,
        });

        return {
          items: result.items.map((item) => ({ ...item })),
          total: result.total,
          page: result.page,
          limit: result.limit,
        };
      }

      const userId = isAdmin ? filters.userId : filters.userId ?? undefined;
      // Allow admins to scope by creator or user; non-admins fall back to creator scoping.
      const createdBy = isAdmin ? filters.createdBy : session.userId;

      const result = await this.inversify.bddService.athleteInfo.list({
        userId,
        userIds: filters.userIds,
        createdBy,
        includeArchived,
        limit: filters.limit,
        page: filters.page,
      });

      return {
        items: result.items.map((item) => ({ ...item })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListAthleteInfosUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_ATHLETE_INFOS_USECASE);
    }
  }

  private async listCoachAthleteIds(coachId: string): Promise<string[]> {
    const limit = 200;
    let page = 1;
    let total = 0;
    const athleteIds = new Set<string>();

    do {
      const result = await this.inversify.bddService.coachAthlete.list({
        coachId,
        is_active: true,
        includeArchived: false,
        activeAt: new Date(),
        limit,
        page,
      });
      total = result.total;
      result.items.forEach((item) => {
        if (item.athleteId) athleteIds.add(item.athleteId);
      });
      page += 1;
    } while (athleteIds.size < total && total > 0);

    return Array.from(athleteIds);
  }
}
