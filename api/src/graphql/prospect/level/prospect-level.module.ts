// src/graphql/prospect/level/prospect-level.module.ts
import { Module } from '@nestjs/common';

import { ProspectLevelResolver } from './prospect-level.resolver';

@Module({
  imports: [],
  providers: [ProspectLevelResolver],
})
export class ProspectLevelModule { }
