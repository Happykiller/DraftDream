// src\graphql\session\session.module.ts
import { Module } from '@nestjs/common';
import { SessionResolver } from '@graphql/session/session.resolver';

@Module({
  imports: [],
  providers: [SessionResolver],
})
export class SessionModule {}
