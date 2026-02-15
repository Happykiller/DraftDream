import { DailyReport } from '@services/db/models/daily-report.model';
import { DailyReportUsecaseModel } from './daily-report.usecase.model';

export function mapDailyReportToUsecase(model: DailyReport): DailyReportUsecaseModel {
  return {
    ...model,
  };
}
