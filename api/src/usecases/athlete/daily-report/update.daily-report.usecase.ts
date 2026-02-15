import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { mapDailyReportToUsecase } from './daily-report.mapper';
import { DailyReportUsecaseModel } from './daily-report.usecase.model';
import { UpdateDailyReportUsecaseDto } from './daily-report.usecase.dto';

export class UpdateDailyReportUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: UpdateDailyReportUsecaseDto): Promise<DailyReportUsecaseModel | null> {
    try {
      const { session, id, ...patch } = dto;
      const existing = await this.inversify.bddService.dailyReport.get({ id });
      if (!existing) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isAthleteCreator = session.role === Role.ATHLETE && existing.createdBy === session.userId;
      if (!isAdmin && !isAthleteCreator) {
        throw new Error(ERRORS.UPDATE_DAILY_REPORT_FORBIDDEN);
      }

      const updated = await this.inversify.bddService.dailyReport.update(id, patch);
      return updated ? mapDailyReportToUsecase(updated) : null;
    } catch (error: any) {
      if (error?.message === ERRORS.UPDATE_DAILY_REPORT_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`UpdateDailyReportUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_DAILY_REPORT_USECASE);
    }
  }
}
