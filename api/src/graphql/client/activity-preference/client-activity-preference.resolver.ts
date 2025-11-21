// src/graphql/client/activity-preference/client-activity-preference.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import inversify from '@src/inversify/investify';

import {
  ClientActivityPreferenceGql,
  ClientActivityPreferenceListGql,
  ClientActivityPreferenceVisibility,
  CreateClientActivityPreferenceInput,
  ListClientActivityPreferencesInput,
  UpdateClientActivityPreferenceInput,
} from './client-activity-preference.gql.types';
import { mapClientActivityPreferenceUsecaseToGql } from './client-activity-preference.mapper';

@Resolver(() => ClientActivityPreferenceGql)
export class ClientActivityPreferenceResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() preference: ClientActivityPreferenceGql): Promise<UserGql | null> {
    const userId = preference.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ClientActivityPreferenceGql, { name: 'clientActivityPreference_create', nullable: true })
  @Auth(Role.ADMIN)
  async clientActivityPreference_create(
    @Args('input') input: CreateClientActivityPreferenceInput,
    @Context('req') req: any,
  ): Promise<ClientActivityPreferenceGql | null> {
    const created = await inversify.createClientActivityPreferenceUsecase.execute({
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapClientActivityPreferenceUsecaseToGql(created) : null;
  }

  @Query(() => ClientActivityPreferenceGql, { name: 'clientActivityPreference_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async clientActivityPreference_get(@Args('id', { type: () => ID }) id: string): Promise<ClientActivityPreferenceGql | null> {
    const found = await inversify.getClientActivityPreferenceUsecase.execute({ id });
    return found ? mapClientActivityPreferenceUsecaseToGql(found) : null;
  }

  @Query(() => ClientActivityPreferenceListGql, { name: 'clientActivityPreference_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async clientActivityPreference_list(
    @Args('input', { nullable: true }) input?: ListClientActivityPreferencesInput,
  ): Promise<ClientActivityPreferenceListGql> {
    const visibility =
      input?.visibility === undefined
        ? undefined
        : input.visibility === ClientActivityPreferenceVisibility.PUBLIC
          ? 'public'
          : 'private';
    const res = await inversify.listClientActivityPreferencesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapClientActivityPreferenceUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ClientActivityPreferenceGql, { name: 'clientActivityPreference_update', nullable: true })
  @Auth(Role.ADMIN)
  async clientActivityPreference_update(
    @Args('input') input: UpdateClientActivityPreferenceInput,
  ): Promise<ClientActivityPreferenceGql | null> {
    const updated = await inversify.updateClientActivityPreferenceUsecase.execute({
      id: input.id,
      locale: input.locale,
      label: input.label,
      visibility:
        input.visibility === undefined
          ? undefined
          : input.visibility === ClientActivityPreferenceVisibility.PUBLIC
            ? 'public'
            : 'private',
    });
    return updated ? mapClientActivityPreferenceUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'clientActivityPreference_delete' })
  @Auth(Role.ADMIN)
  async clientActivityPreference_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteClientActivityPreferenceUsecase.execute({ id });
  }
}
