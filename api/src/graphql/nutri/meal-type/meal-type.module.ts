// src/graphql/meal-type/meal-type.module.ts
import { Module } from '@nestjs/common';

import { MealTypeResolver } from '@src/graphql/nutri/meal-type/meal-type.resolver';

@Module({
  imports: [],
  providers: [MealTypeResolver],
})
/** Nest module exposing the meal type resolver. */
export class MealTypeModule {}
