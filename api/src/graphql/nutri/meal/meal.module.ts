// src/graphql/meal/meal.module.ts
import { Module } from '@nestjs/common';

import { MealResolver } from '@src/graphql/nutri/meal/meal.resolver';

@Module({
  imports: [],
  providers: [MealResolver],
})
/** Nest module exposing the meal resolver. */
export class MealModule {}
