// src\graphql\user\user.module.ts
import { Module } from '@nestjs/common';

import { UserResolver } from '@graphql/user/user.resolver';

@Module({
  imports: [],
  providers: [
    UserResolver,
  ],
})
export class UserModule {}
