// src\graphql\user\user.module.ts
import { Module } from '@nestjs/common';

import { ExerciseResolver } from '@graphql/exercise/exercise.resolver';

@Module({
  imports: [],
  providers: [
    ExerciseResolver,
  ],
})
export class ExerciseModule {}
