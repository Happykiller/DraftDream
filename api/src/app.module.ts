// src\app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { TagModule } from '@graphql/tag/tag.module';
import { UserModule } from '@graphql/user/user.module';
import { AuthModule } from '@graphql/auth/auth.module';
import { SystemModule } from '@graphql/system/system.module';
import { MuscleModule } from '@graphql/muscle/muscle.module';
import { CategoryModule } from '@graphql/category/category.module';
import { EquipmentModule } from '@graphql/equipment/equipment.module';

@Module({
  imports: [
    AppModule,
    AuthModule,
    UserModule,
    SystemModule,
    CategoryModule,
    EquipmentModule,
    MuscleModule,
    TagModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'gqlschema.gql',
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    })
  ],
})
export class AppModule {}
