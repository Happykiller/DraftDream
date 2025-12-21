// src/nestjs/user/user.resolver.ts
import { Resolver, Mutation, Args, Query, Context, ID } from '@nestjs/graphql';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { Auth } from '@graphql/decorators/auth.decorator';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import {
  CreateUserInput, UserGql, UserPageGql, ListUsersInput, UpdateUserInput, UpdateMeInput
} from '@graphql/user/user.gql.types';
import { UserUsecaseModel } from '@usecases/user/user.usecase.model';
import { CreateUserUsecaseDto, UpdateMeUsecaseDto } from '@usecases/user/user.usecase.dto';
import { ListUserUsecaseDto, UpdateUserUsecaseDto, UpdateUserPasswordUsecaseDto } from '@usecases/user/user.usecase.dto';

@Resolver(() => UserGql)
export class UserResolver {

  @Mutation(() => UserGql, { name: 'user_create' })
  @Auth(Role.ADMIN)
  async user_create(
    @Args('input') input: CreateUserInput,
    @Context('req') req: any,
  ): Promise<UserGql> {
    const dto: CreateUserUsecaseDto = {
      type: input.type,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      address: input.address ? { ...input.address } : undefined,
      password: input.password,
      confirm_password: input.confirm_password,
      company: input.company ? {
        name: input.company.name,
        address: input.company.address ? { ...input.company.address } : undefined,
      } : undefined,
      is_active: input.is_active ?? true,
      createdBy: req?.user?.id,
    };

    const created: UserUsecaseModel = await inversify.createUserUsecase.execute(dto);
    return mapUserUsecaseToGql(created);
  }

  @Query(() => UserGql, { name: 'me' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async me(@Context('req') req: any): Promise<UserGql> {
    const user: UserUsecaseModel = await inversify.getUserUsecase.execute({ id: req?.user.id });
    return mapUserUsecaseToGql(user);
  }

  @Query(() => UserPageGql, { name: 'user_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async user_list(
    @Args('input', { nullable: true }) input?: ListUsersInput
  ): Promise<UserPageGql> {
    const dto: ListUserUsecaseDto = {
      q: input?.q,
      type: input?.type,
      companyName: input?.companyName,
      is_active: input?.is_active,
      createdBy: input?.createdBy,
      page: input?.page,
      limit: input?.limit,
    };
    const page = await inversify.listUsersUsecase.execute(dto);
    return {
      items: page.items.map(mapUserUsecaseToGql),
      total: page.total,
      page: page.page,
      limit: page.limit,
    };
  }

  @Mutation(() => UserGql, { name: 'user_update' })
  @Auth(Role.ADMIN)
  async user_update(
    @Args('input') input: UpdateUserInput,
  ): Promise<UserGql> {
    const dto: UpdateUserUsecaseDto = {
      id: input.id,
      type: input.type,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      address: input.address ? { ...input.address } : undefined,
      company: input.company ? {
        name: input.company.name,
        address: input.company.address ? { ...input.company.address } : undefined,
      } : undefined,
      is_active: input.is_active,
    };

    const updated: UserUsecaseModel = await inversify.updateUserUsecase.execute(dto);
    return mapUserUsecaseToGql(updated);
  }

  @Mutation(() => Boolean, { name: 'user_delete' })
  @Auth(Role.ADMIN)
  async user_delete(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return inversify.deleteUserUsecase.execute(id);
  }

  @Mutation(() => Boolean, { name: 'user_hard_delete' })
  @Auth(Role.ADMIN)
  async user_hard_delete(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return inversify.hardDeleteUserUsecase.execute(id);
  }

  @Mutation(() => Boolean, { name: 'user_update_password' })
  @Auth(Role.ADMIN)
  async user_update_password(
    @Args('id', { type: () => ID }) id: string,
    @Args('password') password: string,
  ): Promise<boolean> {
    const dto: UpdateUserPasswordUsecaseDto = { id, password };
    return inversify.updateUserPasswordUsecase.execute(dto);
  }

  @Mutation(() => UserGql, { name: 'me_update' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async me_update(
    @Args('input') input: UpdateMeInput,
    @Context('req') req: any,
  ): Promise<UserGql> {
    const dto: UpdateMeUsecaseDto = {
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      address: input.address ? { ...input.address } : undefined,
      company: input.company ? {
        name: input.company.name,
        address: input.company.address ? { ...input.company.address } : undefined,
      } : undefined,
    };

    const updated: UserUsecaseModel = await inversify.updateMeUsecase.execute(req?.user?.id, dto);
    return mapUserUsecaseToGql(updated);
  }

  @Mutation(() => Boolean, { name: 'me_update_password' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async me_update_password(
    @Args('password') password: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    return inversify.updateMePasswordUsecase.execute(req?.user?.id, password);
  }
}
