// src/graphql/athlete/coach-athlete/coach-athlete.module.ts
import { Module } from '@nestjs/common';

import { CoachAthleteResolver } from './coach-athlete.resolver';

@Module({
  imports: [],
  providers: [CoachAthleteResolver],
})
export class CoachAthleteModule {}
