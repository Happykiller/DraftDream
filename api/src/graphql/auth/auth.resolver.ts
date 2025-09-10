// src/nestjs/auth/auth.resolver.ts
import { Resolver, Mutation, Args } from '@nestjs/graphql';

import inversify from '@src/inversify/investify';
import { AuthInput, SessionGql } from '@graphql/auth/auth.gql.types';


@Resolver(() => SessionGql)
export class AuthResolver {
  @Mutation(() => SessionGql, { name: 'auth' })
  async auth(
    @Args('input') input: AuthInput,
  ): Promise<SessionGql> {
      return await inversify.authUsecase.execute(input);
    }
}
