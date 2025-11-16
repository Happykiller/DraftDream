// src\\graphql\\program\\program.module.ts
import { Module } from '@nestjs/common';

import { ProgramSessionExerciseResolver } from '@src/graphql/sport/program/program-session-exercise.resolver';
import { ProgramResolver } from '@src/graphql/sport/program/program.resolver';

@Module({
  providers: [ProgramResolver, ProgramSessionExerciseResolver],
})
export class ProgramModule {}
