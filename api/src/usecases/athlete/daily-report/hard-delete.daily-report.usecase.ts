import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { HardDeleteDailyReportUsecaseDto } from './daily-report.usecase.dto';

export class HardDeleteDailyReportUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: HardDeleteDailyReportUsecaseDto): Promise<boolean> {
    try {
      if (dto.session.role !== Role.ADMIN) {
        throw new Error(ERRORS.HARD_DELETE_DAILY_REPORT_FORBIDDEN);
      }

      return this.inversify.bddService.dailyReport.hardDelete(dto.id);
    } catch (error: any) {
      if (error?.message === ERRORS.HARD_DELETE_DAILY_REPORT_FORBIDDEN) {
        throw error;
      }
      this.inversify.loggerService.error(`HardDeleteDailyReportUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.HARD_DELETE_DAILY_REPORT_USECASE);
    }
  }
}
