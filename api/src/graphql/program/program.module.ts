// src\\graphql\\program\\program.module.ts
import { Module } from '@nestjs/common';

import { ProgramSessionExerciseResolver } from '@graphql/program/program-session-exercise.resolver';
import { ProgramResolver } from '@graphql/program/program.resolver';

@Module({
  providers: [ProgramResolver, ProgramSessionExerciseResolver],
})
export class ProgramModule {}
