// src\graphql\user\user.module.ts
import { Module } from '@nestjs/common';

import { MuscleResolver } from '@graphql/muscle/muscle.resolver';

@Module({
  imports: [],
  providers: [
    MuscleResolver,
  ],
})
export class MuscleModule {}
