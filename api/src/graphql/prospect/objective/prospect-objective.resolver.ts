// src/graphql/prospect/objective/prospect-objective.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ProspectObjectiveGql,
  ProspectObjectiveListGql,
  ProspectObjectiveVisibility,
  CreateProspectObjectiveInput,
  ListProspectObjectivesInput,
  UpdateProspectObjectiveInput,
} from './prospect-objective.gql.types';
import { mapProspectObjectiveUsecaseToGql } from './prospect-objective.mapper';

@Resolver(() => ProspectObjectiveGql)
export class ProspectObjectiveResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() objective: ProspectObjectiveGql): Promise<UserGql | null> {
    const userId = objective.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ProspectObjectiveGql, { name: 'prospectObjective_create', nullable: true })
  @Auth(Role.ADMIN)
  async prospectObjective_create(
    @Args('input') input: CreateProspectObjectiveInput,
    @Context('req') req: any,
  ): Promise<ProspectObjectiveGql | null> {
    const created = await inversify.createClientObjectiveUsecase.execute({
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapProspectObjectiveUsecaseToGql(created) : null;
  }

  @Query(() => ProspectObjectiveGql, { name: 'prospectObjective_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async prospectObjective_get(@Args('id', { type: () => ID }) id: string): Promise<ProspectObjectiveGql | null> {
    const found = await inversify.getClientObjectiveUsecase.execute({ id });
    return found ? mapProspectObjectiveUsecaseToGql(found) : null;
  }

  @Query(() => ProspectObjectiveListGql, { name: 'prospectObjective_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async prospectObjective_list(
    @Args('input', { nullable: true }) input?: ListProspectObjectivesInput,
  ): Promise<ProspectObjectiveListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ProspectObjectiveVisibility.PUBLIC
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
      items: res.items.map(mapProspectObjectiveUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ProspectObjectiveGql, { name: 'prospectObjective_update', nullable: true })
  @Auth(Role.ADMIN)
  async prospectObjective_update(
    @Args('input') input: UpdateProspectObjectiveInput,
  ): Promise<ProspectObjectiveGql | null> {
    const updated = await inversify.updateClientObjectiveUsecase.execute({
      id: input.id,
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ProspectObjectiveVisibility.PUBLIC
            ? 'public'
            : 'private',
    });
    return updated ? mapProspectObjectiveUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'prospectObjective_delete' })
  @Auth(Role.ADMIN)
  async prospectObjective_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await inversify.deleteClientObjectiveUsecase.execute({ id });
  }
}
