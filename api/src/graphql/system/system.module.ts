// src\graphql\system\system.module.ts
import { Module } from '@nestjs/common';

import { SystemResolver } from '@graphql/system/system.resolver';

@Module({
  imports: [],
  providers: [
    SystemResolver,
  ],
})
export class SystemModule {}
