// src/graphql/client/level/client-level.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ClientLevelGql,
  ClientLevelListGql,
  ClientLevelVisibility,
  CreateClientLevelInput,
  ListClientLevelsInput,
  UpdateClientLevelInput,
} from './client-level.gql.types';
import { mapClientLevelUsecaseToGql } from './client-level.mapper';

@Resolver(() => ClientLevelGql)
export class ClientLevelResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() level: ClientLevelGql): Promise<UserGql | null> {
    const userId = level.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ClientLevelGql, { name: 'clientLevel_create', nullable: true })
  @Auth(Role.ADMIN)
  async clientLevel_create(
    @Args('input') input: CreateClientLevelInput,
    @Context('req') req: any,
  ): Promise<ClientLevelGql | null> {
    const created = await inversify.createClientLevelUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapClientLevelUsecaseToGql(created) : null;
  }

  @Query(() => ClientLevelGql, { name: 'clientLevel_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async clientLevel_get(@Args('id', { type: () => ID }) id: string): Promise<ClientLevelGql | null> {
    const found = await inversify.getClientLevelUsecase.execute({ id });
    return found ? mapClientLevelUsecaseToGql(found) : null;
  }

  @Query(() => ClientLevelListGql, { name: 'clientLevel_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async clientLevel_list(
    @Args('input', { nullable: true }) input?: ListClientLevelsInput,
  ): Promise<ClientLevelListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ClientLevelVisibility.PUBLIC
          ? 'public'
          : 'private';
    const res = await inversify.listClientLevelsUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapClientLevelUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ClientLevelGql, { name: 'clientLevel_update', nullable: true })
  @Auth(Role.ADMIN)
  async clientLevel_update(
    @Args('input') input: UpdateClientLevelInput,
  ): Promise<ClientLevelGql | null> {
    const updated = await inversify.updateClientLevelUsecase.execute({
      id: input.id,
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ClientLevelVisibility.PUBLIC
            ? 'public'
            : 'private',
    });
    return updated ? mapClientLevelUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'clientLevel_delete' })
  @Auth(Role.ADMIN)
  async clientLevel_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteClientLevelUsecase.execute({ id });
  }
}
