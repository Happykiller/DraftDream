// src\app.module.ts

import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { TagModule } from '@graphql/tag/tag.module';
import { UserModule } from '@graphql/user/user.module';
import { AuthModule } from '@graphql/auth/auth.module';
import { SystemModule } from '@graphql/system/system.module';
import { MuscleModule } from '@src/graphql/sport/muscle/muscle.module';
import { SessionModule } from '@src/graphql/sport/session/session.module';
import { ProgramModule } from '@src/graphql/sport/program/program.module';
import { ExerciseModule } from '@src/graphql/sport/exercise/exercise.module';
import { CategoryModule } from '@graphql/sport/category/category.module';
import { ClientObjectiveModule } from '@graphql/client/objective/client-objective.module';
import { ClientActivityPreferenceModule } from '@graphql/client/activity-preference/client-activity-preference.module';
import { ClientStatusModule } from '@graphql/client/status/client-status.module';
import { ClientLevelModule } from '@graphql/client/level/client-level.module';
import { ClientSourceModule } from '@graphql/client/source/client-source.module';
import { EquipmentModule } from '@src/graphql/sport/equipment/equipment.module';
import { MealTypeModule } from '@src/graphql/nutri/meal-type/meal-type.module';
import { MealDayModule } from '@src/graphql/nutri/meal-day/meal-day.module';
import { MealModule } from '@src/graphql/nutri/meal/meal.module';
import { MealPlanModule } from '@src/graphql/nutri/meal-plan/meal-plan.module';

@Module({
  imports: [
    AppModule,
    TagModule,
    AuthModule,
    UserModule,
    SystemModule,
    MuscleModule,
    SessionModule,
    ProgramModule,
    CategoryModule,
    ClientObjectiveModule,
    ClientActivityPreferenceModule,
    ClientStatusModule,
    ClientLevelModule,
    ClientSourceModule,
    ExerciseModule,
    EquipmentModule,
    MealTypeModule,
    MealDayModule,
    MealModule,
    MealPlanModule,
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: 'gqlschema.gql',
    })
  ],
})
export class AppModule {}
