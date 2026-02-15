import { DailyReportUsecaseModel } from '@usecases/athlete/daily-report/daily-report.usecase.model';
import { DailyReportGql } from './daily-report.gql.types';

export function mapDailyReportUsecaseToGql(model: DailyReportUsecaseModel): DailyReportGql {
  return {
    ...model,
    painZones: model.painZones ?? [],
  };
}
