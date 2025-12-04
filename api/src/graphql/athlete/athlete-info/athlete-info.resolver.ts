// src/graphql/athlete/athlete-info/athlete-info.resolver.ts
import { UnauthorizedException } from '@nestjs/common';
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { ProspectLevelGql } from '@graphql/prospect/level/prospect-level.gql.types';
import { mapProspectLevelUsecaseToGql } from '@graphql/prospect/level/prospect-level.mapper';
import { ProspectObjectiveGql } from '@graphql/prospect/objective/prospect-objective.gql.types';
import { mapProspectObjectiveUsecaseToGql } from '@graphql/prospect/objective/prospect-objective.mapper';
import { ProspectActivityPreferenceGql } from '@graphql/prospect/activity-preference/prospect-activity-preference.gql.types';
import { mapProspectActivityPreferenceUsecaseToGql } from '@graphql/prospect/activity-preference/prospect-activity-preference.mapper';

import {
  AthleteInfoGql,
  AthleteInfoListGql,
  CreateAthleteInfoInput,
  ListAthleteInfosInput,
  UpdateAthleteInfoInput,
} from './athlete-info.gql.types';
import { mapAthleteInfoUsecaseToGql } from './athlete-info.mapper';
import type { UsecaseSession } from '@usecases/athlete/athlete-info/athlete-info.usecase.dto';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';
import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';

@Resolver(() => AthleteInfoGql)
export class AthleteInfoResolver {
  @ResolveField(() => UserGql, { name: 'athlete', nullable: true })
  async athlete(@Parent() info: AthleteInfoGql): Promise<UserGql | null> {
    const user = await inversify.getUserUsecase.execute({ id: info.userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() info: AthleteInfoGql): Promise<UserGql | null> {
    const user = await inversify.getUserUsecase.execute({ id: info.createdBy });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => ProspectLevelGql, { name: 'level', nullable: true })
  async level(@Parent() info: AthleteInfoGql): Promise<ProspectLevelGql | null> {
    if (!info.levelId) return null;
    const level = await inversify.getClientLevelUsecase.execute({ id: info.levelId });
    return level ? mapProspectLevelUsecaseToGql(level) : null;
  }

  @ResolveField(() => [ProspectObjectiveGql], { name: 'objectives' })
  async objectives(@Parent() info: AthleteInfoGql): Promise<ProspectObjectiveGql[]> {
    if (!info.objectiveIds?.length) return [];
    const items = await Promise.all(
      info.objectiveIds.map((id) => inversify.getClientObjectiveUsecase.execute({ id })),
    );
    return items.filter((item): item is ProspectObjective => item !== null).map((item) => mapProspectObjectiveUsecaseToGql(item));
  }

  @ResolveField(() => [ProspectActivityPreferenceGql], { name: 'activityPreferences' })
  async activityPreferences(@Parent() info: AthleteInfoGql): Promise<ProspectActivityPreferenceGql[]> {
    if (!info.activityPreferenceIds?.length) return [];
    const items = await Promise.all(
      info.activityPreferenceIds.map((id) => inversify.getClientActivityPreferenceUsecase.execute({ id })),
    );
    return items
      .filter((item): item is ProspectActivityPreference => item !== null)
      .map((item) => mapProspectActivityPreferenceUsecaseToGql(item));
  }

  @Mutation(() => AthleteInfoGql, { name: 'athleteInfo_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async athleteInfo_create(
    @Args('input') input: CreateAthleteInfoInput,
    @Context('req') req: any,
  ): Promise<AthleteInfoGql | null> {
    const session = this.extractSession(req);
    const created = await inversify.createAthleteInfoUsecase.execute({
      userId: input.userId,
      levelId: input.levelId,
      objectiveIds: input.objectiveIds?.filter(Boolean),
      activityPreferenceIds: input.activityPreferenceIds?.filter(Boolean),
      medicalConditions: input.medicalConditions,
      allergies: input.allergies,
      notes: input.notes,
      session,
    });
    return created ? mapAthleteInfoUsecaseToGql(created) : null;
  }

  @Query(() => AthleteInfoGql, { name: 'athleteInfo_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async athleteInfo_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<AthleteInfoGql | null> {
    const session = this.extractSession(req);
    const found = await inversify.getAthleteInfoUsecase.execute({ id, session });
    return found ? mapAthleteInfoUsecaseToGql(found) : null;
  }

  @Query(() => AthleteInfoListGql, { name: 'athleteInfo_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async athleteInfo_list(
    @Args('input', { type: () => ListAthleteInfosInput, nullable: true }) input: ListAthleteInfosInput | null,
    @Context('req') req: any,
  ): Promise<AthleteInfoListGql> {
    const session = this.extractSession(req);
    const result = await inversify.listAthleteInfosUsecase.execute({
      userId: input?.userId,
      createdBy: input?.createdBy,
      includeArchived: input?.includeArchived,
      limit: input?.limit,
      page: input?.page,
      session,
    });

    return {
      items: result.items.map(mapAthleteInfoUsecaseToGql),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Mutation(() => AthleteInfoGql, { name: 'athleteInfo_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async athleteInfo_update(
    @Args('input') input: UpdateAthleteInfoInput,
    @Context('req') req: any,
  ): Promise<AthleteInfoGql | null> {
    const session = this.extractSession(req);
    const updated = await inversify.updateAthleteInfoUsecase.execute({
      id: input.id,
      userId: input.userId,
      levelId: input.levelId,
      objectiveIds: input.objectiveIds?.filter(Boolean),
      activityPreferenceIds: input.activityPreferenceIds?.filter(Boolean),
      medicalConditions: input.medicalConditions,
      allergies: input.allergies,
      notes: input.notes,
      session,
    });
    return updated ? mapAthleteInfoUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'athleteInfo_delete' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async athleteInfo_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return await inversify.deleteAthleteInfoUsecase.execute({ id, session });
  }

  @Mutation(() => Boolean, { name: 'athleteInfo_hardDelete' })
  @Auth(Role.ADMIN)
  async athleteInfo_hardDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return await inversify.hardDeleteAthleteInfoUsecase.execute({ id, session });
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
