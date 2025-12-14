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
      const isFilteringByUser = Boolean(filters.userId);

      const includeArchived = isAdmin ? filters.includeArchived : false;
      const userId = isAdmin ? filters.userId : filters.userId ?? undefined;
      // Allow coaches to fetch athlete profiles by user identifier while keeping creator scoping when no user filter is provided.
      const createdBy = isAdmin ? filters.createdBy : isFilteringByUser ? undefined : session.userId;

      const result = await this.inversify.bddService.athleteInfo.list({
        userId,
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
}
