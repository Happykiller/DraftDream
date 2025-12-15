// src/graphql/prospect/activity-preference/prospect-activity-preference.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ProspectActivityPreferenceGql,
  ProspectActivityPreferenceListGql,
  ProspectActivityPreferenceVisibility,
  CreateProspectActivityPreferenceInput,
  ListProspectActivityPreferencesInput,
  UpdateProspectActivityPreferenceInput,
} from './prospect-activity-preference.gql.types';
import { mapProspectActivityPreferenceUsecaseToGql } from './prospect-activity-preference.mapper';

@Resolver(() => ProspectActivityPreferenceGql)
export class ProspectActivityPreferenceResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() preference: ProspectActivityPreferenceGql): Promise<UserGql | null> {
    const userId = preference.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ProspectActivityPreferenceGql, { name: 'prospectActivityPreference_create', nullable: true })
  @Auth(Role.ADMIN)
  async prospectActivityPreference_create(
    @Args('input') input: CreateProspectActivityPreferenceInput,
    @Context('req') req: any,
  ): Promise<ProspectActivityPreferenceGql | null> {
    const created = await inversify.createClientActivityPreferenceUsecase.execute({
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapProspectActivityPreferenceUsecaseToGql(created) : null;
  }

  @Query(() => ProspectActivityPreferenceGql, { name: 'prospectActivityPreference_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async prospectActivityPreference_get(@Args('id', { type: () => ID }) id: string): Promise<ProspectActivityPreferenceGql | null> {
    const found = await inversify.getClientActivityPreferenceUsecase.execute({ id });
    return found ? mapProspectActivityPreferenceUsecaseToGql(found) : null;
  }

  @Query(() => ProspectActivityPreferenceListGql, { name: 'prospectActivityPreference_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async prospectActivityPreference_list(
    @Args('input', { nullable: true }) input?: ListProspectActivityPreferencesInput,
  ): Promise<ProspectActivityPreferenceListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ProspectActivityPreferenceVisibility.PUBLIC
          ? 'PUBLIC'
          : 'PRIVATE';
    const res = await inversify.listClientActivityPreferencesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapProspectActivityPreferenceUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ProspectActivityPreferenceGql, { name: 'prospectActivityPreference_update', nullable: true })
  @Auth(Role.ADMIN)
  async prospectActivityPreference_update(
    @Args('input') input: UpdateProspectActivityPreferenceInput,
  ): Promise<ProspectActivityPreferenceGql | null> {
    const updated = await inversify.updateClientActivityPreferenceUsecase.execute({
      id: input.id,
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ProspectActivityPreferenceVisibility.PUBLIC
            ? 'PUBLIC'
            : 'PRIVATE',
    });
    return updated ? mapProspectActivityPreferenceUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'prospectActivityPreference_delete' })
  @Auth(Role.ADMIN)
  async prospectActivityPreference_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await inversify.deleteClientActivityPreferenceUsecase.execute({ id });
  }
}
