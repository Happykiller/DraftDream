import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { mapDailyReportToUsecase } from './daily-report.mapper';
import { ListDailyReportsUsecaseDto } from './daily-report.usecase.dto';
import { DailyReportUsecaseModel } from './daily-report.usecase.model';

interface ListDailyReportsUsecaseResult {
  items: DailyReportUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

export class ListDailyReportsUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListDailyReportsUsecaseDto): Promise<ListDailyReportsUsecaseResult> {
    try {
      const { session, ...filters } = dto;

      if (session.role === Role.ADMIN) {
        const result = await this.inversify.bddService.dailyReport.list(filters);
        return {
          items: result.items.map(mapDailyReportToUsecase),
          total: result.total,
          page: result.page,
          limit: result.limit,
        };
      }

      if (session.role === Role.ATHLETE) {
        if (filters.athleteId && filters.athleteId !== session.userId) {
          throw new Error(ERRORS.LIST_DAILY_REPORTS_FORBIDDEN);
        }

        if (filters.createdBy && filters.createdBy !== session.userId) {
          throw new Error(ERRORS.LIST_DAILY_REPORTS_FORBIDDEN);
        }

        const result = await this.inversify.bddService.dailyReport.list({
          ...filters,
          athleteId: session.userId,
          createdBy: filters.createdBy ?? session.userId,
        });

        return {
          items: result.items.map(mapDailyReportToUsecase),
          total: result.total,
          page: result.page,
          limit: result.limit,
        };
      }

      if (session.role === Role.COACH) {
        const athleteIds = await this.resolveActiveAthleteIds(session.userId);
        if (!athleteIds.length) {
          return {
            items: [],
            total: 0,
            page: filters.page ?? 1,
            limit: filters.limit ?? 20,
          };
        }

        if (filters.athleteId && !athleteIds.includes(filters.athleteId)) {
          throw new Error(ERRORS.LIST_DAILY_REPORTS_FORBIDDEN);
        }

        if (filters.createdBy && !athleteIds.includes(filters.createdBy)) {
          throw new Error(ERRORS.LIST_DAILY_REPORTS_FORBIDDEN);
        }

        const result = await this.inversify.bddService.dailyReport.list({
          ...filters,
          athleteId: filters.athleteId,
          athleteIds: filters.athleteId ? undefined : athleteIds,
        });

        return {
          items: result.items.map(mapDailyReportToUsecase),
          total: result.total,
          page: result.page,
          limit: result.limit,
        };
      }

      throw new Error(ERRORS.LIST_DAILY_REPORTS_FORBIDDEN);
    } catch (error: any) {
      if (error?.message === ERRORS.LIST_DAILY_REPORTS_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`ListDailyReportsUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_DAILY_REPORTS_USECASE);
    }
  }

  private async resolveActiveAthleteIds(coachId: string): Promise<string[]> {
    const result = await this.inversify.bddService.coachAthlete.list({
      coachId,
      is_active: true,
      includeArchived: false,
      activeAt: new Date(),
      limit: 500,
      page: 1,
    });

    return result.items.map((item) => item.athleteId);
  }
}
