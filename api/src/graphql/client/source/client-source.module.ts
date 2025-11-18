// src/graphql/client/source/client-source.module.ts
import { Module } from '@nestjs/common';

import { ClientSourceResolver } from './client-source.resolver';

@Module({
  imports: [],
  providers: [ClientSourceResolver],
})
export class ClientSourceModule {}
