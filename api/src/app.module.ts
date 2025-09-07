import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import inversify from '@src/inversify/investify';
import { HelloResolver } from './hello.resolver';
import { UserModule } from '@nestjs/user/user.module';

@Module({
  imports: [
    AppModule,
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
