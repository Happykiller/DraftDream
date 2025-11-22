// src/graphql/prospect/source/prospect-source.module.ts
import { Module } from '@nestjs/common';

import { ProspectSourceResolver } from './prospect-source.resolver';

@Module({
  imports: [],
  providers: [ProspectSourceResolver],
})
export class ProspectSourceModule { }
