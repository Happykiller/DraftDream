// src/graphql/nutri/meal-record/meal-record.module.ts
import { Module } from '@nestjs/common';

import { MealRecordResolver } from './meal-record.resolver';

/**
 * Nest module exposing the meal record resolver.
 */
@Module({
  providers: [MealRecordResolver],
})
export class MealRecordModule { }
