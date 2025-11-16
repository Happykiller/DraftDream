// src/graphql/meal-plan/meal-plan.module.ts
import { Module } from '@nestjs/common';

import { MealPlanResolver } from '@src/graphql/nutri/meal-plan/meal-plan.resolver';

@Module({
  providers: [MealPlanResolver],
})
export class MealPlanModule {}
