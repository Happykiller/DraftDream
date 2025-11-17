// src/graphql/athlete/coach-athlete/coach-athlete.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';

import {
  CoachAthleteGql,
  CoachAthleteListGql,
  CreateCoachAthleteInput,
  ListCoachAthletesInput,
  UpdateCoachAthleteInput,
} from './coach-athlete.gql.types';
import { mapCoachAthleteUsecaseToGql } from './coach-athlete.mapper';

/**
 * GraphQL resolver exposing coach-athlete relation operations.
 */
@Resolver(() => CoachAthleteGql)
export class CoachAthleteResolver {
  /**
   * Resolves the coach entity tied to the link.
   */
  @ResolveField(() => UserGql, { name: 'coach', nullable: true })
  async coach(@Parent() link: CoachAthleteGql): Promise<UserGql | null> {
    const user = await inversify.getUserUsecase.execute({ id: link.coachId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  /**
   * Resolves the athlete entity tied to the link.
   */
  @ResolveField(() => UserGql, { name: 'athlete', nullable: true })
  async athlete(@Parent() link: CoachAthleteGql): Promise<UserGql | null> {
    const user = await inversify.getUserUsecase.execute({ id: link.athleteId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  /**
   * Creates a new relation between a coach and an athlete.
   */
  @Mutation(() => CoachAthleteGql, { name: 'coachAthlete_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async coachAthlete_create(
    @Args('input') input: CreateCoachAthleteInput,
    @Context('req') req: any,
  ): Promise<CoachAthleteGql | null> {
    const created = await inversify.createCoachAthleteUsecase.execute({
      coachId: input.coachId,
      athleteId: input.athleteId,
      startDate: input.startDate,
      endDate: input.endDate ?? undefined,
      note: input.note,
      is_active: input.is_active,
      createdBy: req?.user?.id,
    });
    return created ? mapCoachAthleteUsecaseToGql(created) : null;
  }

  /**
   * Retrieves a single relation by id.
   */
  @Query(() => CoachAthleteGql, { name: 'coachAthlete_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async coachAthlete_get(@Args('id', { type: () => ID }) id: string): Promise<CoachAthleteGql | null> {
    const found = await inversify.getCoachAthleteUsecase.execute({ id });
    return found ? mapCoachAthleteUsecaseToGql(found) : null;
  }

  /**
   * Lists relations visible to the requester.
   */
  @Query(() => CoachAthleteListGql, { name: 'coachAthlete_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async coachAthlete_list(
    @Args('input', { nullable: true }) input?: ListCoachAthletesInput,
  ): Promise<CoachAthleteListGql> {
    const result = await inversify.listCoachAthletesUsecase.execute({
      coachId: input?.coachId,
      athleteId: input?.athleteId,
      is_active: input?.is_active,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
      includeArchived: input?.includeArchived,
    });
    return {
      items: result.items.map(mapCoachAthleteUsecaseToGql),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Updates an existing relation.
   */
  @Mutation(() => CoachAthleteGql, { name: 'coachAthlete_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async coachAthlete_update(
    @Args('input') input: UpdateCoachAthleteInput,
  ): Promise<CoachAthleteGql | null> {
    const updated = await inversify.updateCoachAthleteUsecase.execute({
      id: input.id,
      coachId: input.coachId,
      athleteId: input.athleteId,
      startDate: input.startDate ?? undefined,
      endDate: input.endDate === null ? null : input.endDate ?? undefined,
      note: input.note === null ? null : input.note ?? undefined,
      is_active: input.is_active,
    });
    return updated ? mapCoachAthleteUsecaseToGql(updated) : null;
  }

  /**
   * Soft deletes a relation.
   */
  @Mutation(() => Boolean, { name: 'coachAthlete_delete' })
  @Auth(Role.ADMIN, Role.COACH)
  async coachAthlete_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteCoachAthleteUsecase.execute({ id });
  }
}
