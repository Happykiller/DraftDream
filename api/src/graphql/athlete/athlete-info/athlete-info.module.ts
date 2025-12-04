// src/graphql/athlete/athlete-info/athlete-info.module.ts
import { Module } from '@nestjs/common';

import { AthleteInfoResolver } from './athlete-info.resolver';

@Module({
  imports: [],
  providers: [AthleteInfoResolver],
})
export class AthleteInfoModule {}
