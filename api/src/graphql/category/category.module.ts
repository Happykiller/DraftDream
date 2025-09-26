// src\graphql\user\user.module.ts
import { Module } from '@nestjs/common';

import { CategoryResolver } from '@graphql/category/category.resolver';

@Module({
  imports: [],
  providers: [
    CategoryResolver,
  ],
})
export class CategoryModule {}
