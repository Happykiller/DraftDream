import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { mapDailyReportToUsecase } from './daily-report.mapper';
import { GetDailyReportUsecaseDto } from './daily-report.usecase.dto';
import { DailyReportUsecaseModel } from './daily-report.usecase.model';

export class GetDailyReportUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetDailyReportUsecaseDto): Promise<DailyReportUsecaseModel | null> {
    try {
      const report = await this.inversify.bddService.dailyReport.get({ id: dto.id });
      if (!report) {
        return null;
      }

      const isAdmin = dto.session.role === Role.ADMIN;
      const isAthleteOwner = dto.session.role === Role.ATHLETE && report.athleteId === dto.session.userId;
      const canCoachAccess = dto.session.role === Role.COACH
        && await this.isCoachLinkedToAthlete(dto.session.userId, report.athleteId);

      if (!isAdmin && !isAthleteOwner && !canCoachAccess) {
        throw new Error(ERRORS.GET_DAILY_REPORT_FORBIDDEN);
      }

      return mapDailyReportToUsecase(report);
    } catch (error: any) {
      if (error?.message === ERRORS.GET_DAILY_REPORT_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`GetDailyReportUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.GET_DAILY_REPORT_USECASE);
    }
  }

  private async isCoachLinkedToAthlete(coachId: string, athleteId: string): Promise<boolean> {
    const links = await this.inversify.bddService.coachAthlete.list({
      coachId,
      athleteId,
      is_active: true,
      includeArchived: false,
      activeAt: new Date(),
      limit: 1,
      page: 1,
    });

    return links.total > 0;
  }
}
