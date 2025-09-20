// src\app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';


import { UserModule } from '@graphql/user/user.module';
import { AuthModule } from '@graphql/auth/auth.module';
import { SystemModule } from '@graphql/system/system.module';

@Module({
  imports: [
    AppModule,
    AuthModule,
    UserModule,
    SystemModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'gqlschema.gql',
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    })
  ],
})
export class AppModule {}
