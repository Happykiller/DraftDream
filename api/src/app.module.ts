// src\app.module.ts

import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { TagModule } from '@graphql/tag/tag.module';
import { TaskModule } from '@graphql/task/task.module';
import { UserModule } from '@graphql/user/user.module';
import { AuthModule } from '@graphql/auth/auth.module';
import { SystemModule } from '@graphql/system/system.module';
import { MuscleModule } from '@src/graphql/sport/muscle/muscle.module';
import { SessionModule } from '@src/graphql/sport/session/session.module';
import { ProgramModule } from '@src/graphql/sport/program/program.module';
import { ProgramRecordModule } from '@src/graphql/sport/program-record/program-record.module';
import { ExerciseModule } from '@src/graphql/sport/exercise/exercise.module';
import { CategoryModule } from '@graphql/sport/category/category.module';
import { ProspectObjectiveModule } from '@graphql/prospect/objective/prospect-objective.module';
import { ProspectActivityPreferenceModule } from '@graphql/prospect/activity-preference/prospect-activity-preference.module';
import { ProspectLevelModule } from '@graphql/prospect/level/prospect-level.module';
import { ProspectSourceModule } from '@graphql/prospect/source/prospect-source.module';
import { ProspectModule } from '@graphql/prospect/prospect/prospect.module';
import { EquipmentModule } from '@src/graphql/sport/equipment/equipment.module';
import { MealTypeModule } from '@src/graphql/nutri/meal-type/meal-type.module';
import { MealDayModule } from '@src/graphql/nutri/meal-day/meal-day.module';
import { MealModule } from '@src/graphql/nutri/meal/meal.module';
import { MealPlanModule } from '@src/graphql/nutri/meal-plan/meal-plan.module';
import { MealRecordModule } from '@src/graphql/nutri/meal-record/meal-record.module';
import { CoachAthleteModule } from '@graphql/athlete/coach-athlete/coach-athlete.module';
import { AthleteInfoModule } from '@graphql/athlete/athlete-info/athlete-info.module';

@Module({
  imports: [
    AppModule,
    TagModule,
    TaskModule,
    AuthModule,
    UserModule,
    SystemModule,
    MuscleModule,
    SessionModule,
    ProgramModule,
    ProgramRecordModule,
    CategoryModule,
    ProspectObjectiveModule,
    ProspectActivityPreferenceModule,
    ProspectLevelModule,
    ProspectSourceModule,
    ProspectModule,
    ExerciseModule,
    EquipmentModule,
    MealTypeModule,
    MealDayModule,
    MealModule,
    MealPlanModule,
    MealRecordModule,
    CoachAthleteModule,
    AthleteInfoModule,
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: 'gqlschema.gql',
    })
  ],
})
export class AppModule { }
