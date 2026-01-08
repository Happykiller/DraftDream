// src/graphql/sport/program-record/program-record.module.ts
import { Module } from '@nestjs/common';

import { ProgramRecordResolver } from './program-record.resolver';

@Module({
  imports: [],
  providers: [ProgramRecordResolver],
})
export class ProgramRecordModule {}
