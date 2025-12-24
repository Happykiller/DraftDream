// src/graphql/prospect/source/prospect-source.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ProspectSourceGql,
  ProspectSourceListGql,
  ProspectSourceVisibility,
  CreateProspectSourceInput,
  ListProspectSourcesInput,
  UpdateProspectSourceInput,
} from './prospect-source.gql.types';
import { mapProspectSourceUsecaseToGql } from './prospect-source.mapper';

@Resolver(() => ProspectSourceGql)
export class ProspectSourceResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() source: ProspectSourceGql): Promise<UserGql | null> {
    const userId = source.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ProspectSourceGql, { name: 'prospectSource_create', nullable: true })
  @Auth(Role.ADMIN)
  async prospectSource_create(
    @Args('input') input: CreateProspectSourceInput,
    @Context('req') req: any,
  ): Promise<ProspectSourceGql | null> {
    const created = await inversify.createClientSourceUsecase.execute({
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapProspectSourceUsecaseToGql(created) : null;
  }

  @Query(() => ProspectSourceGql, { name: 'prospectSource_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async prospectSource_get(@Args('id', { type: () => ID }) id: string): Promise<ProspectSourceGql | null> {
    const found = await inversify.getClientSourceUsecase.execute({ id });
    return found ? mapProspectSourceUsecaseToGql(found) : null;
  }

  @Query(() => ProspectSourceListGql, { name: 'prospectSource_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async prospectSource_list(
    @Args('input', { nullable: true }) input?: ListProspectSourcesInput,
  ): Promise<ProspectSourceListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ProspectSourceVisibility.PUBLIC
          ? 'PUBLIC'
          : 'PRIVATE';
    const res = await inversify.listClientSourcesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapProspectSourceUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ProspectSourceGql, { name: 'prospectSource_update', nullable: true })
  @Auth(Role.ADMIN)
  async prospectSource_update(
    @Args('input') input: UpdateProspectSourceInput,
  ): Promise<ProspectSourceGql | null> {
    const updated = await inversify.updateClientSourceUsecase.execute({
      id: input.id,
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ProspectSourceVisibility.PUBLIC
            ? 'PUBLIC'
            : 'PRIVATE',
    });
    return updated ? mapProspectSourceUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'prospectSource_delete' })
  @Auth(Role.ADMIN)
  async prospectSource_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await inversify.deleteClientSourceUsecase.execute({ id });
  }
}
