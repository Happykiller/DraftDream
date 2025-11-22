// src/graphql/prospect/level/prospect-level.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ProspectLevelGql,
  ProspectLevelListGql,
  ProspectLevelVisibility,
  CreateProspectLevelInput,
  ListProspectLevelsInput,
  UpdateProspectLevelInput,
} from './prospect-level.gql.types';
import { mapProspectLevelUsecaseToGql } from './prospect-level.mapper';

@Resolver(() => ProspectLevelGql)
export class ProspectLevelResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() level: ProspectLevelGql): Promise<UserGql | null> {
    const userId = level.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ProspectLevelGql, { name: 'prospectLevel_create', nullable: true })
  @Auth(Role.ADMIN)
  async prospectLevel_create(
    @Args('input') input: CreateProspectLevelInput,
    @Context('req') req: any,
  ): Promise<ProspectLevelGql | null> {
    const created = await inversify.createClientLevelUsecase.execute({
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapProspectLevelUsecaseToGql(created) : null;
  }

  @Query(() => ProspectLevelGql, { name: 'prospectLevel_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async prospectLevel_get(@Args('id', { type: () => ID }) id: string): Promise<ProspectLevelGql | null> {
    const found = await inversify.getClientLevelUsecase.execute({ id });
    return found ? mapProspectLevelUsecaseToGql(found) : null;
  }

  @Query(() => ProspectLevelListGql, { name: 'prospectLevel_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async prospectLevel_list(
    @Args('input', { nullable: true }) input?: ListProspectLevelsInput,
  ): Promise<ProspectLevelListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ProspectLevelVisibility.PUBLIC
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
      items: res.items.map(mapProspectLevelUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ProspectLevelGql, { name: 'prospectLevel_update', nullable: true })
  @Auth(Role.ADMIN)
  async prospectLevel_update(
    @Args('input') input: UpdateProspectLevelInput,
  ): Promise<ProspectLevelGql | null> {
    const updated = await inversify.updateClientLevelUsecase.execute(input.id, {
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ProspectLevelVisibility.PUBLIC
            ? 'public'
            : 'private',
    });
    return updated ? mapProspectLevelUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'prospectLevel_delete' })
  @Auth(Role.ADMIN)
  async prospectLevel_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await inversify.deleteClientLevelUsecase.execute({ id });
  }
}
