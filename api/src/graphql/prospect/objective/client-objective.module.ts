// src/graphql/client/objective/client-objective.module.ts
import { Module } from '@nestjs/common';

import { ClientObjectiveResolver } from './client-objective.resolver';

@Module({
  imports: [],
  providers: [
    ClientObjectiveResolver,
  ],
})
export class ClientObjectiveModule {}
