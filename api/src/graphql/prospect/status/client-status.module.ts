// src/graphql/client/status/client-status.module.ts
import { Module } from '@nestjs/common';

import { ClientStatusResolver } from './client-status.resolver';

@Module({
  imports: [],
  providers: [ClientStatusResolver],
})
export class ClientStatusModule {}
