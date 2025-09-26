// src\graphql\user\user.module.ts
import { Module } from '@nestjs/common';

import { TagResolver } from '@graphql/tag/tag.resolver';

@Module({
  imports: [],
  providers: [
    TagResolver,
  ],
})
export class TagModule {}
