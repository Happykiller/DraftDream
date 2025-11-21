// src/graphql/meal-day/meal-day.resolver.ts

import { UnauthorizedException } from '@nestjs/common';
import {
  Args,
  Context,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Role } from '@graphql/common/ROLE';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  CreateMealDayInput,
  ListMealDaysInput,
  MealDayGql,
  MealDayListGql,
  UpdateMealDayInput,
} from '@src/graphql/nutri/meal-day/meal-day.gql.types';
import { mapMealDayUsecaseToGql } from '@src/graphql/nutri/meal-day/meal-day.mapper';
import { mapMealUsecaseToGql } from '@src/graphql/nutri/meal/meal.mapper';
import { MealGql } from '@src/graphql/nutri/meal/meal.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import inversify from '@src/inversify/investify';
import type { UsecaseSession } from '@src/usecases/sport/program/program.usecase.dto';

@Resolver(() => MealDayGql)
export class MealDayResolver {
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() mealDay: MealDayGql): Promise<UserGql | null> {
    const userId = mealDay.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => [MealGql], { name: 'meals', nullable: true })
  async meals(
    @Parent() mealDay: MealDayGql,
  ): Promise<MealGql[]> {
    const mealIds = mealDay.mealIds ?? [];
    if (mealIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(mealIds));
    const fetched = await Promise.all(
      uniqueIds.map(async (mealId) => {
        const meal = await inversify.getMealUsecase.execute({ id: mealId });
        return meal ? mapMealUsecaseToGql(meal) : null;
      }),
    );

    const lookup = new Map<string, MealGql>();
    for (const meal of fetched) {
      if (meal) {
        lookup.set(meal.id, meal);
      }
    }

    return mealIds
      .map((id) => lookup.get(id))
      .filter((meal): meal is MealGql => Boolean(meal));
  }

  @Mutation(() => MealDayGql, { name: 'mealDay_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async mealDay_create(
    @Args('input') input: CreateMealDayInput,
    @Context('req') req: any,
  ): Promise<MealDayGql | null> {
    const created = await inversify.createMealDayUsecase.execute({
      locale: input.locale,
      label: input.label,
      description: input.description,
      mealIds: input.mealIds,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapMealDayUsecaseToGql(created) : null;
  }

  @Mutation(() => MealDayGql, { name: 'mealDay_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async mealDay_update(
    @Args('input') input: UpdateMealDayInput,
  ): Promise<MealDayGql | null> {
    const updated = await inversify.updateMealDayUsecase.execute(input.id, {
      locale: input.locale,
      label: input.label,
      description: input.description,
      mealIds: input.mealIds,
      visibility: input.visibility,
    });
    return updated ? mapMealDayUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'mealDay_delete' })
  @Auth(Role.ADMIN, Role.COACH)
  async mealDay_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteMealDayUsecase.execute({ id, session });
  }

  @Query(() => MealDayGql, { name: 'mealDay_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async mealDay_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<MealDayGql | null> {
    const session = this.extractSession(req);
    const found = await inversify.getMealDayUsecase.execute({ id, session });
    return found ? mapMealDayUsecaseToGql(found) : null;
  }

  @Query(() => MealDayListGql, { name: 'mealDay_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async mealDay_list(
    @Args('input', { type: () => ListMealDaysInput, nullable: true })
    input: ListMealDaysInput | null = null,
    @Context('req') req: any,
  ): Promise<MealDayListGql> {
    const session = this.extractSession(req);
    const res = await inversify.listMealDaysUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      visibility: input?.visibility,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
      session,
    });

    return {
      items: res.items.map(mapMealDayUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
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

