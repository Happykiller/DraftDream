// src\graphql\session\session.module.ts
import { Module } from '@nestjs/common';
import { SessionResolver } from '@src/graphql/sport/session/session.resolver';

@Module({
  imports: [],
  providers: [SessionResolver],
})
export class SessionModule {}
