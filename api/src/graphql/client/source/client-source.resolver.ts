// src/graphql/client/source/client-source.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ClientSourceGql,
  ClientSourceListGql,
  ClientSourceVisibility,
  CreateClientSourceInput,
  ListClientSourcesInput,
  UpdateClientSourceInput,
} from './client-source.gql.types';
import { mapClientSourceUsecaseToGql } from './client-source.mapper';

@Resolver(() => ClientSourceGql)
export class ClientSourceResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() source: ClientSourceGql): Promise<UserGql | null> {
    const userId = source.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ClientSourceGql, { name: 'clientSource_create', nullable: true })
  @Auth(Role.ADMIN)
  async clientSource_create(
    @Args('input') input: CreateClientSourceInput,
    @Context('req') req: any,
  ): Promise<ClientSourceGql | null> {
    const created = await inversify.createClientSourceUsecase.execute({
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapClientSourceUsecaseToGql(created) : null;
  }

  @Query(() => ClientSourceGql, { name: 'clientSource_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async clientSource_get(@Args('id', { type: () => ID }) id: string): Promise<ClientSourceGql | null> {
    const found = await inversify.getClientSourceUsecase.execute({ id });
    return found ? mapClientSourceUsecaseToGql(found) : null;
  }

  @Query(() => ClientSourceListGql, { name: 'clientSource_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async clientSource_list(
    @Args('input', { nullable: true }) input?: ListClientSourcesInput,
  ): Promise<ClientSourceListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ClientSourceVisibility.PUBLIC
          ? 'public'
          : 'private';
    const res = await inversify.listClientSourcesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapClientSourceUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ClientSourceGql, { name: 'clientSource_update', nullable: true })
  @Auth(Role.ADMIN)
  async clientSource_update(
    @Args('input') input: UpdateClientSourceInput,
  ): Promise<ClientSourceGql | null> {
    const updated = await inversify.updateClientSourceUsecase.execute({
      id: input.id,
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ClientSourceVisibility.PUBLIC
            ? 'public'
            : 'private',
    });
    return updated ? mapClientSourceUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'clientSource_delete' })
  @Auth(Role.ADMIN)
  async clientSource_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteClientSourceUsecase.execute({ id });
  }
}
