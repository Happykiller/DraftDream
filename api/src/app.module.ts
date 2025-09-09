import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import inversify from '@src/inversify/investify';
import { HelloResolver } from './hello.resolver';
import { UserModule } from '@nestjs/user/user.module';
import { AuthModule } from '@nestjs/auth/auth.module';

@Module({
  imports: [
    AppModule,
    AuthModule,
    UserModule.forRoot({ inversify }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'gqlschema.gql',
      playground: true,
    })
  ],
  providers: [HelloResolver],
})
export class AppModule {}
