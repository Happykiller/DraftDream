import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { DeleteDailyReportUsecaseDto } from './daily-report.usecase.dto';

export class DeleteDailyReportUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteDailyReportUsecaseDto): Promise<boolean> {
    try {
      const existing = await this.inversify.bddService.dailyReport.get({ id: dto.id });
      if (!existing) {
        return false;
      }

      const isAdmin = dto.session.role === Role.ADMIN;
      const isAthleteCreator = dto.session.role === Role.ATHLETE && existing.createdBy === dto.session.userId;
      if (!isAdmin && !isAthleteCreator) {
        throw new Error(ERRORS.DELETE_DAILY_REPORT_FORBIDDEN);
      }

      return this.inversify.bddService.dailyReport.delete(dto.id);
    } catch (error: any) {
      if (error?.message === ERRORS.DELETE_DAILY_REPORT_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`DeleteDailyReportUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.DELETE_DAILY_REPORT_USECASE);
    }
  }
}
