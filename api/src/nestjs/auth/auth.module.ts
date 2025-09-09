// src\nestjs\auth\auth.module.ts
import { Module } from '@nestjs/common';

import { AuthResolver } from '@nestjs/auth/auth.resolver';

@Module({
  imports: [],
  providers: [
    AuthResolver,
  ],
})
export class AuthModule {}
