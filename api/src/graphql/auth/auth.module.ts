// src\nestjs\auth\auth.module.ts
import { Module } from '@nestjs/common';

import { AuthResolver } from '@graphql/auth/auth.resolver';

@Module({
  imports: [],
  providers: [
    AuthResolver,
  ],
})
export class AuthModule {}
