// src/graphql/client/status/client-status.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ClientStatusGql,
  ClientStatusListGql,
  ClientStatusVisibility,
  CreateClientStatusInput,
  ListClientStatusesInput,
  UpdateClientStatusInput,
} from './client-status.gql.types';
import { mapClientStatusUsecaseToGql } from './client-status.mapper';

@Resolver(() => ClientStatusGql)
export class ClientStatusResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() status: ClientStatusGql): Promise<UserGql | null> {
    const userId = status.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ClientStatusGql, { name: 'clientStatus_create', nullable: true })
  @Auth(Role.ADMIN)
  async clientStatus_create(
    @Args('input') input: CreateClientStatusInput,
    @Context('req') req: any,
  ): Promise<ClientStatusGql | null> {
    const created = await inversify.createClientStatusUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapClientStatusUsecaseToGql(created) : null;
  }

  @Query(() => ClientStatusGql, { name: 'clientStatus_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async clientStatus_get(@Args('id', { type: () => ID }) id: string): Promise<ClientStatusGql | null> {
    const found = await inversify.getClientStatusUsecase.execute({ id });
    return found ? mapClientStatusUsecaseToGql(found) : null;
  }

  @Query(() => ClientStatusListGql, { name: 'clientStatus_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async clientStatus_list(
    @Args('input', { nullable: true }) input?: ListClientStatusesInput,
  ): Promise<ClientStatusListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ClientStatusVisibility.PUBLIC
          ? 'public'
          : 'private';
    const res = await inversify.listClientStatusesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapClientStatusUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ClientStatusGql, { name: 'clientStatus_update', nullable: true })
  @Auth(Role.ADMIN)
  async clientStatus_update(
    @Args('input') input: UpdateClientStatusInput,
  ): Promise<ClientStatusGql | null> {
    const updated = await inversify.updateClientStatusUsecase.execute({
      id: input.id,
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ClientStatusVisibility.PUBLIC
            ? 'public'
            : 'private',
    });
    return updated ? mapClientStatusUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'clientStatus_delete' })
  @Auth(Role.ADMIN)
  async clientStatus_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteClientStatusUsecase.execute({ id });
  }
}
