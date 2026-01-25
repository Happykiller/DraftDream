// src/graphql/task/task.module.ts
import { Module } from '@nestjs/common';

import { TaskResolver } from '@graphql/task/task.resolver';

@Module({
  imports: [],
  providers: [
    TaskResolver,
  ],
})
export class TaskModule {}
