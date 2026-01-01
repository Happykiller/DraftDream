// src/graphql/nutri/meal-record/meal-record.resolver.ts
import { UnauthorizedException } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import type { UsecaseSession } from '@src/usecases/nutri/meal-record/meal-record.usecase.dto';

import {
  CreateMealRecordInput,
  ListMealRecordsInput,
  MealRecordGql,
  MealRecordListGql,
  UpdateMealRecordInput,
} from './meal-record.gql.types';
import { mapMealRecordUsecaseToGql } from './meal-record.mapper';

/**
 * GraphQL resolver for meal record operations.
 */
@Resolver(() => MealRecordGql)
export class MealRecordResolver {
  /**
   * Creates a meal record entry.
   */
  @Mutation(() => MealRecordGql, { name: 'mealRecord_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async mealRecord_create(
    @Args('input') input: CreateMealRecordInput,
    @Context('req') req: any,
  ): Promise<MealRecordGql | null> {
    const session = this.extractSession(req);
    const created = await inversify.createMealRecordUsecase.execute({
      userId: input.userId,
      mealPlanId: input.mealPlanId,
      mealDayId: input.mealDayId,
      mealId: input.mealId,
      state: input.state ?? undefined,
      session,
    });

    return created ? mapMealRecordUsecaseToGql(created) : null;
  }

  /**
   * Updates the state of a meal record.
   */
  @Mutation(() => MealRecordGql, { name: 'mealRecord_updateState', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async mealRecord_updateState(
    @Args('input') input: UpdateMealRecordInput,
    @Context('req') req: any,
  ): Promise<MealRecordGql | null> {
    const session = this.extractSession(req);
    const updated = await inversify.updateMealRecordUsecase.execute({
      id: input.id,
      state: input.state,
      session,
    });
    return updated ? mapMealRecordUsecaseToGql(updated) : null;
  }

  /**
   * Soft deletes a meal record.
   */
  @Mutation(() => Boolean, { name: 'mealRecord_delete' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async mealRecord_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteMealRecordUsecase.execute({ id, session });
  }

  /**
   * Hard deletes a meal record.
   */
  @Mutation(() => Boolean, { name: 'mealRecord_hardDelete' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async mealRecord_hardDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.hardDeleteMealRecordUsecase.execute({ id, session });
  }

  /**
   * Retrieves a meal record by id.
   */
  @Query(() => MealRecordGql, { name: 'mealRecord_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async mealRecord_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<MealRecordGql | null> {
    const session = this.extractSession(req);
    const found = await inversify.getMealRecordUsecase.execute({ id, session });
    return found ? mapMealRecordUsecaseToGql(found) : null;
  }

  /**
   * Lists meal records based on the provided filters.
   */
  @Query(() => MealRecordListGql, { name: 'mealRecord_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async mealRecord_list(
    @Args('input', { type: () => ListMealRecordsInput, nullable: true }) input: ListMealRecordsInput | null,
    @Context('req') req: any,
  ): Promise<MealRecordListGql> {
    const session = this.extractSession(req);
    const result = await inversify.listMealRecordsUsecase.execute({
      userId: input?.userId,
      mealPlanId: input?.mealPlanId,
      mealDayId: input?.mealDayId,
      mealId: input?.mealId,
      state: input?.state,
      includeArchived: input?.includeArchived,
      limit: input?.limit,
      page: input?.page,
      session,
    });

    return {
      items: result.items.map(mapMealRecordUsecaseToGql),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Extracts the authenticated session from the request.
   */
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
