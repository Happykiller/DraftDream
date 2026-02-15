import { Module } from '@nestjs/common';

import { DailyReportResolver } from './daily-report.resolver';

@Module({
  providers: [DailyReportResolver],
})
export class DailyReportModule {}
