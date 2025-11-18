// src\graphql\user\user.module.ts
import { Module } from '@nestjs/common';

import { ExerciseResolver } from '@src/graphql/sport/exercise/exercise.resolver';

@Module({
  imports: [],
  providers: [
    ExerciseResolver,
  ],
})
export class ExerciseModule {}
