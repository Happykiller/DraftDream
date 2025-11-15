// src/graphql/client/objective/client-objective.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ClientObjectiveGql,
  ClientObjectiveListGql,
  ClientObjectiveVisibility,
  CreateClientObjectiveInput,
  ListClientObjectivesInput,
  UpdateClientObjectiveInput,
} from './client-objective.gql.types';
import { mapClientObjectiveUsecaseToGql } from './client-objective.mapper';

@Resolver(() => ClientObjectiveGql)
export class ClientObjectiveResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() objective: ClientObjectiveGql): Promise<UserGql | null> {
    const userId = objective.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ClientObjectiveGql, { name: 'clientObjective_create', nullable: true })
  @Auth(Role.ADMIN)
  async clientObjective_create(
    @Args('input') input: CreateClientObjectiveInput,
    @Context('req') req: any,
  ): Promise<ClientObjectiveGql | null> {
    const created = await inversify.createClientObjectiveUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapClientObjectiveUsecaseToGql(created) : null;
  }

  @Query(() => ClientObjectiveGql, { name: 'clientObjective_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async clientObjective_get(@Args('id', { type: () => ID }) id: string): Promise<ClientObjectiveGql | null> {
    const found = await inversify.getClientObjectiveUsecase.execute({ id });
    return found ? mapClientObjectiveUsecaseToGql(found) : null;
  }

  @Query(() => ClientObjectiveListGql, { name: 'clientObjective_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async clientObjective_list(
    @Args('input', { nullable: true }) input?: ListClientObjectivesInput,
  ): Promise<ClientObjectiveListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ClientObjectiveVisibility.PUBLIC
          ? 'public'
          : 'private';
    const res = await inversify.listClientObjectivesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapClientObjectiveUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ClientObjectiveGql, { name: 'clientObjective_update', nullable: true })
  @Auth(Role.ADMIN)
  async clientObjective_update(
    @Args('input') input: UpdateClientObjectiveInput,
  ): Promise<ClientObjectiveGql | null> {
    const updated = await inversify.updateClientObjectiveUsecase.execute({
      id: input.id,
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ClientObjectiveVisibility.PUBLIC
            ? 'public'
            : 'private',
    });
    return updated ? mapClientObjectiveUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'clientObjective_delete' })
  @Auth(Role.ADMIN)
  async clientObjective_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteClientObjectiveUsecase.execute({ id });
  }
}
