// src\\graphql\\program\\program.module.ts
import { Module } from '@nestjs/common';

import { ProgramResolver } from '@graphql/program/program.resolver';

@Module({
  providers: [ProgramResolver],
})
export class ProgramModule {}
