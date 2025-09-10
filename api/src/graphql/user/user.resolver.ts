// src/nestjs/user/user.resolver.ts
import { Resolver, Mutation, Args } from '@nestjs/graphql';

import inversify from '@src/inversify/investify';
import { CreateUserUsecase } from '@usecases/user/create.user.usecase';
import { CreateUserInput, UserGql } from '@graphql/user/user.gql.types';
import { UserUsecaseModel } from '@usecases/user/model/user.usecase.model';
import { CreateUserUsecaseDto } from '@usecases/user/dto/create.user.usecase.dto';


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

      // Instancie le usecase avec ton container inversify
      const usecase = new CreateUserUsecase(inversify);
      const created: UserUsecaseModel = await usecase.execute(dto);

      // Map vers le type GraphQL de sortie
      const out: UserGql = {
        id: created.id,
        type: created.type,
        first_name: created.first_name,
        last_name: created.last_name,
        email: created.email,
        phone: created.phone,
        address: created.address
          ? {
              name: created.address.name,
              city: created.address.city,
              code: created.address.code,
              country: created.address.country,
            }
          : undefined,
        company: created.company
          ? {
              name: created.company.name,
              address: created.company.address
                ? {
                    name: created.company.address.name,
                    city: created.company.address.city,
                    code: created.company.address.code,
                    country: created.company.address.country,
                  }
                : undefined,
            }
          : undefined,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
      return out;
    }
}
