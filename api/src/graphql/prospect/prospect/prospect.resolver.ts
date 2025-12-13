import { UnauthorizedException } from '@nestjs/common';
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapProspectLevelUsecaseToGql } from '@graphql/prospect/level/prospect-level.mapper';
import { ProspectLevelGql } from '@graphql/prospect/level/prospect-level.gql.types';
import { mapProspectSourceUsecaseToGql } from '@graphql/prospect/source/prospect-source.mapper';
import { ProspectSourceGql } from '@graphql/prospect/source/prospect-source.gql.types';
import { mapProspectObjectiveUsecaseToGql } from '@graphql/prospect/objective/prospect-objective.mapper';
import { ProspectObjectiveGql } from '@graphql/prospect/objective/prospect-objective.gql.types';
import { mapProspectActivityPreferenceUsecaseToGql } from '@graphql/prospect/activity-preference/prospect-activity-preference.mapper';
import { ProspectActivityPreferenceGql } from '@graphql/prospect/activity-preference/prospect-activity-preference.gql.types';

import {
  ProspectGql,
  ProspectListGql,
  CreateProspectInput,
  ListProspectsInput,
  UpdateProspectInput,
  ConvertProspectInput,
  ProspectConversionGql,
} from './prospect.gql.types';
import { mapProspectConversionUsecaseToGql, mapProspectUsecaseToGql } from './prospect.mapper';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import type { UsecaseSession } from '@usecases/prospect/prospect/prospect.usecase.dto';

@Resolver(() => ProspectGql)
export class ProspectResolver {
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() prospect: ProspectGql): Promise<UserGql | null> {
    const userId = prospect.createdBy;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => ProspectLevelGql, { name: 'level', nullable: true })
  async level(@Parent() prospect: ProspectGql): Promise<ProspectLevelGql | null> {
    if (!prospect.levelId) return null;
    const level = await inversify.getClientLevelUsecase.execute({ id: prospect.levelId });
    return level ? mapProspectLevelUsecaseToGql(level) : null;
  }

  @ResolveField(() => ProspectSourceGql, { name: 'source', nullable: true })
  async source(@Parent() prospect: ProspectGql): Promise<ProspectSourceGql | null> {
    if (!prospect.sourceId) return null;
    const source = await inversify.getClientSourceUsecase.execute({ id: prospect.sourceId });
    return source ? mapProspectSourceUsecaseToGql(source) : null;
  }

  @ResolveField(() => [ProspectObjectiveGql], { name: 'objectives', nullable: 'itemsAndList' })
  async objectives(@Parent() prospect: ProspectGql): Promise<ProspectObjectiveGql[]> {
    if (!prospect.objectiveIds?.length) return [];
    const items = await Promise.all(
      prospect.objectiveIds.map((id) => inversify.getClientObjectiveUsecase.execute({ id })),
    );
    return items.filter((item): item is ProspectObjective => item !== null).map((item) => mapProspectObjectiveUsecaseToGql(item));
  }

  @ResolveField(() => [ProspectActivityPreferenceGql], { name: 'activityPreferences', nullable: 'itemsAndList' })
  async activityPreferences(@Parent() prospect: ProspectGql): Promise<ProspectActivityPreferenceGql[]> {
    if (!prospect.activityPreferenceIds?.length) return [];
    const items = await Promise.all(
      prospect.activityPreferenceIds.map((id) => inversify.getClientActivityPreferenceUsecase.execute({ id })),
    );
    return items.filter((item): item is ProspectActivityPreference => item !== null).map((item) => mapProspectActivityPreferenceUsecaseToGql(item));
  }

  @Mutation(() => ProspectGql, { name: 'prospect_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async prospect_create(
    @Args('input') input: CreateProspectInput,
    @Context('req') req: any,
  ): Promise<ProspectGql | null> {
    const created = await inversify.createProspectUsecase.execute({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      status: input.status,
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
    return created ? mapProspectUsecaseToGql(created) : null;
  }

  @Query(() => ProspectGql, { name: 'prospect_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async prospect_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<ProspectGql | null> {
    const session = this.extractSession(req);
    const found = await inversify.getProspectUsecase.execute({ id, session });
    return found ? mapProspectUsecaseToGql(found) : null;
  }

  @Query(() => ProspectListGql, { name: 'prospect_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async prospect_list(
    @Args('input', { type: () => ListProspectsInput, nullable: true }) input: ListProspectsInput | null,
    @Context('req') req: any,
  ): Promise<ProspectListGql> {
    const session = this.extractSession(req);
    const res = await inversify.listProspectsUsecase.execute({
      q: input?.q,
      status: input?.status,
      levelId: input?.levelId,
      sourceId: input?.sourceId,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
      session,
    });
    return {
      items: res.items.map(mapProspectUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => ProspectGql, { name: 'prospect_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async prospect_update(@Args('input') input: UpdateProspectInput): Promise<ProspectGql | null> {
    const updated = await inversify.updateProspectUsecase.execute({
      id: input.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      status: input.status,
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
    return updated ? mapProspectUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'prospect_delete' })
  @Auth(Role.ADMIN, Role.COACH)
  async prospect_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await inversify.deleteProspectUsecase.execute({ id });
  }

  @Mutation(() => ProspectConversionGql, { name: 'prospect_convert', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async prospect_convert(
    @Args('input', { type: () => ConvertProspectInput }) input: ConvertProspectInput,
    @Context('req') req: any,
  ): Promise<ProspectConversionGql | null> {
    const session = this.extractSession(req);
    const result = await inversify.convertProspectToAthleteUsecase.execute({
      prospectId: input.prospectId,
      session,
    });

    return result ? mapProspectConversionUsecaseToGql(result) : null;
  }

  private extractSession(req: any): UsecaseSession {
    const user = req?.user;
    if (!user?.id || !user?.role) {
      throw new UnauthorizedException('Missing authenticated user in request context.');
    }

    return {
      userId: String(user.id),
      role: user.role as UsecaseSession['role'],
    };
  }
}
