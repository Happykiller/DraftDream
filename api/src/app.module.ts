// src\app.module.ts

import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { TagModule } from '@graphql/tag/tag.module';
import { UserModule } from '@graphql/user/user.module';
import { AuthModule } from '@graphql/auth/auth.module';
import { SystemModule } from '@graphql/system/system.module';
import { MuscleModule } from '@graphql/muscle/muscle.module';
import { SessionModule } from '@graphql/session/session.module';
import { ProgramModule } from '@graphql/program/program.module';
import { ExerciseModule } from '@graphql/exercise/exercise.module';
import { CategoryModule } from '@graphql/category/category.module';
import { EquipmentModule } from '@graphql/equipment/equipment.module';

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
    ExerciseModule,
    EquipmentModule,
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: 'gqlschema.gql',
    })
  ],
})
export class AppModule {}
