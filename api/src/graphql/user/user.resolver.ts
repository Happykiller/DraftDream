// src/nestjs/user/user.resolver.ts
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';

import inversify from '@src/inversify/investify';
import { CreateUserInput, UserGql } from '@graphql/user/user.gql.types';
import { UserUsecaseModel } from '@usecases/user/model/user.usecase.model';
import { CreateUserUsecaseDto } from '@usecases/user/dto/create.user.usecase.dto';
import { Role } from '../common/ROLE';
import { Auth } from '../decorators/auth.decorator';
import { mapUserUsecaseToGql } from './user.mapper';


@Resolver(() => UserGql)
export class UserResolver {
  // ---- Nouvelle mutation: crée un utilisateur ----
  @Mutation(() => UserGql, { name: 'user_create' })
  async user_create(
    @Args('input') input: CreateUserInput,
  ): Promise<UserGql> {
    // Map 1:1 vers le DTO du usecase
    const dto: CreateUserUsecaseDto = {
      type: input.type,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      address: input.address
        ? {
          name: input.address.name,
          city: input.address.city,
          code: input.address.code,
          country: input.address.country,
        }
        : undefined,
      password: input.password,
      confirm_password: input.confirm_password,
      company: input.company
        ? {
          name: input.company.name,
          address: input.company.address
            ? {
              name: input.company.address.name,
              city: input.company.address.city,
              code: input.company.address.code,
              country: input.company.address.country,
            }
            : undefined,
        }
        : undefined,
    };

    const created: UserUsecaseModel = await inversify.createUserUsecase.execute(dto);

    return mapUserUsecaseToGql(created);
  }

  @Query(() => UserGql, { name: 'me' })
  @Auth(Role.ADMIN, Role.COACH)
  async me(@Context('req') req: any): Promise<UserGql> {
    const user: UserUsecaseModel = await inversify.getUserUsecase.execute({
      id: req?.user.id
    });
    return mapUserUsecaseToGql(user);
  }
}
