// src\nestjs\user\user.module.ts
import { DynamicModule, Module } from '@nestjs/common';

import { UserResolver } from '@nestjs/user/user.resolver';

export interface UserModuleOptions {
  inversify: any;
}

@Module({})
export class UserModule {
  static forRoot(options: UserModuleOptions): DynamicModule {
    return {
      module: UserModule,
      providers: [UserResolver],
      exports: [UserResolver],
    };
  }
}