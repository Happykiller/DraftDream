// src/graphql/meal-day/meal-day.module.ts

import { Module } from '@nestjs/common';

import { MealDayResolver } from '@graphql/meal-day/meal-day.resolver';

@Module({
  imports: [],
  providers: [MealDayResolver],
})
/** Nest module exposing the meal day resolver. */
export class MealDayModule {}

