// src/graphql/prospect/objective/prospect-objective.module.ts
import { Module } from '@nestjs/common';

import { ProspectObjectiveResolver } from './prospect-objective.resolver';

@Module({
  imports: [],
  providers: [ProspectObjectiveResolver],
})
export class ProspectObjectiveModule { }
