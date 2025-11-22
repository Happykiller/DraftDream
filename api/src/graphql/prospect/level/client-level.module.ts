// src/graphql/client/level/client-level.module.ts
import { Module } from '@nestjs/common';

import { ClientLevelResolver } from './client-level.resolver';

@Module({
  imports: [],
  providers: [ClientLevelResolver],
})
export class ClientLevelModule {}
