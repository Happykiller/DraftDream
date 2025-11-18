// src/graphql/client/client/client.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapClientStatusUsecaseToGql } from '@graphql/client/status/client-status.mapper';
import { ClientStatusGql } from '@graphql/client/status/client-status.gql.types';
import { mapClientLevelUsecaseToGql } from '@graphql/client/level/client-level.mapper';
import { ClientLevelGql } from '@graphql/client/level/client-level.gql.types';
import { mapClientSourceUsecaseToGql } from '@graphql/client/source/client-source.mapper';
import { ClientSourceGql } from '@graphql/client/source/client-source.gql.types';
import { mapClientObjectiveUsecaseToGql } from '@graphql/client/objective/client-objective.mapper';
import { ClientObjectiveGql } from '@graphql/client/objective/client-objective.gql.types';
import { mapClientActivityPreferenceUsecaseToGql } from '@graphql/client/activity-preference/client-activity-preference.mapper';
import { ClientActivityPreferenceGql } from '@graphql/client/activity-preference/client-activity-preference.gql.types';

import {
  ClientGql,
  ClientListGql,
  CreateClientInput,
  ListClientsInput,
  UpdateClientInput,
} from './client.gql.types';
import { mapClientUsecaseToGql } from './client.mapper';

@Resolver(() => ClientGql)
export class ClientResolver {
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() client: ClientGql): Promise<UserGql | null> {
    const userId = client.createdBy;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => ClientStatusGql, { name: 'status', nullable: true })
  async status(@Parent() client: ClientGql): Promise<ClientStatusGql | null> {
    if (!client.statusId) return null;
    const status = await inversify.getClientStatusUsecase.execute({ id: client.statusId });
    return status ? mapClientStatusUsecaseToGql(status) : null;
  }

  @ResolveField(() => ClientLevelGql, { name: 'level', nullable: true })
  async level(@Parent() client: ClientGql): Promise<ClientLevelGql | null> {
    if (!client.levelId) return null;
    const level = await inversify.getClientLevelUsecase.execute({ id: client.levelId });
    return level ? mapClientLevelUsecaseToGql(level) : null;
  }

  @ResolveField(() => ClientSourceGql, { name: 'source', nullable: true })
  async source(@Parent() client: ClientGql): Promise<ClientSourceGql | null> {
    if (!client.sourceId) return null;
    const source = await inversify.getClientSourceUsecase.execute({ id: client.sourceId });
    return source ? mapClientSourceUsecaseToGql(source) : null;
  }

  @ResolveField(() => [ClientObjectiveGql], { name: 'objectives', nullable: 'itemsAndList' })
  async objectives(@Parent() client: ClientGql): Promise<ClientObjectiveGql[]> {
    if (!client.objectiveIds?.length) return [];
    const items = await Promise.all(
      client.objectiveIds.map((id) => inversify.getClientObjectiveUsecase.execute({ id })),
    );
    return items.filter(Boolean).map((item) => mapClientObjectiveUsecaseToGql(item!));
  }

  @ResolveField(() => [ClientActivityPreferenceGql], { name: 'activityPreferences', nullable: 'itemsAndList' })
  async activityPreferences(@Parent() client: ClientGql): Promise<ClientActivityPreferenceGql[]> {
    if (!client.activityPreferenceIds?.length) return [];
    const items = await Promise.all(
      client.activityPreferenceIds.map((id) => inversify.getClientActivityPreferenceUsecase.execute({ id })),
    );
    return items.filter(Boolean).map((item) => mapClientActivityPreferenceUsecaseToGql(item!));
  }

  @Mutation(() => ClientGql, { name: 'client_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async client_create(
    @Args('input') input: CreateClientInput,
    @Context('req') req: any,
  ): Promise<ClientGql | null> {
    const created = await inversify.createClientUsecase.execute({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      statusId: input.statusId,
      levelId: input.levelId,
      objectiveIds: input.objectiveIds?.filter(Boolean),
      activityPreferenceIds: input.activityPreferenceIds?.filter(Boolean),
      medicalConditions: input.medicalConditions,
      allergies: input.allergies,
      notes: input.notes,
      sourceId: input.sourceId,
      budget: input.budget,
      dealDescription: input.dealDescription,
      desiredStartDate: input.desiredStartDate ?? undefined,
      createdBy: req?.user?.id,
    });
    return created ? mapClientUsecaseToGql(created) : null;
  }

  @Query(() => ClientGql, { name: 'client_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async client_get(@Args('id', { type: () => ID }) id: string): Promise<ClientGql | null> {
    const found = await inversify.getClientUsecase.execute({ id });
    return found ? mapClientUsecaseToGql(found) : null;
  }

  @Query(() => ClientListGql, { name: 'client_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async client_list(@Args('input', { nullable: true }) input?: ListClientsInput): Promise<ClientListGql> {
    const res = await inversify.listClientsUsecase.execute({
      q: input?.q,
      statusId: input?.statusId,
      levelId: input?.levelId,
      sourceId: input?.sourceId,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapClientUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ClientGql, { name: 'client_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async client_update(@Args('input') input: UpdateClientInput): Promise<ClientGql | null> {
    const updated = await inversify.updateClientUsecase.execute({
      id: input.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      statusId: input.statusId,
      levelId: input.levelId,
      objectiveIds: input.objectiveIds?.filter(Boolean),
      activityPreferenceIds: input.activityPreferenceIds?.filter(Boolean),
      medicalConditions: input.medicalConditions,
      allergies: input.allergies,
      notes: input.notes,
      sourceId: input.sourceId,
      budget: input.budget,
      dealDescription: input.dealDescription,
      desiredStartDate: input.desiredStartDate ?? undefined,
    });
    return updated ? mapClientUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'client_delete' })
  @Auth(Role.ADMIN, Role.COACH)
  async client_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteClientUsecase.execute({ id });
  }
}
