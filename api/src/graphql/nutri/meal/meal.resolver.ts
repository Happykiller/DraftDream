// src/graphql/meal/meal.resolver.ts
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
  CreateMealInput,
  ListMealsInput,
  MealGql,
  MealListGql,
  UpdateMealInput,
} from '@src/graphql/nutri/meal/meal.gql.types';
import { mapMealUsecaseToGql } from '@src/graphql/nutri/meal/meal.mapper';
import { MealTypeGql } from '@src/graphql/nutri/meal-type/meal-type.gql.types';
import { mapMealTypeUsecaseToGql } from '@src/graphql/nutri/meal-type/meal-type.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import inversify from '@src/inversify/investify';

@Resolver(() => MealGql)
export class MealResolver {
  /**
   * Resolves the creator field for a meal.
   */
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() meal: MealGql): Promise<UserGql | null> {
    const userId = meal.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  /**
   * Resolves the meal type associated with the meal.
   */
  @ResolveField(() => MealTypeGql, { name: 'type', nullable: true })
  async type(@Parent() meal: MealGql): Promise<MealTypeGql | null> {
    const typeId = meal.typeId;
    if (!typeId) return null;

    const mealType = await inversify.getMealTypeUsecase.execute({ id: typeId });
    return mealType ? mapMealTypeUsecaseToGql(mealType) : null;
  }

  /**
   * Creates a meal using the authenticated user as owner.
   */
  @Mutation(() => MealGql, { name: 'meal_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async meal_create(
    @Args('input') input: CreateMealInput,
    @Context('req') req: any,
  ): Promise<MealGql | null> {
    const created = await inversify.createMealUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      typeId: input.typeId,
      foods: input.foods,
      calories: input.calories,
      proteinGrams: input.proteinGrams,
      carbGrams: input.carbGrams,
      fatGrams: input.fatGrams,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapMealUsecaseToGql(created) : null;
  }

  /**
   * Retrieves a meal by its identifier.
   */
  @Query(() => MealGql, { name: 'meal_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async meal_get(@Args('id', { type: () => ID }) id: string): Promise<MealGql | null> {
    const found = await inversify.getMealUsecase.execute({ id });
    return found ? mapMealUsecaseToGql(found) : null;
  }

  /**
   * Lists meals with optional filtering.
   */
  @Query(() => MealListGql, { name: 'meal_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async meal_list(
    @Args('input', { nullable: true }) input?: ListMealsInput,
  ): Promise<MealListGql> {
    const res = await inversify.listMealsUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      typeId: input?.typeId,
      createdBy: input?.createdBy,
      visibility: input?.visibility,
      limit: input?.limit,
      page: input?.page,
    });

    return {
      items: res.items.map(mapMealUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  /**
   * Updates a meal by applying the provided patch.
   */
  @Mutation(() => MealGql, { name: 'meal_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async meal_update(
    @Args('input') input: UpdateMealInput,
  ): Promise<MealGql | null> {
    const updated = await inversify.updateMealUsecase.execute({
      id: input.id,
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      typeId: input.typeId,
      foods: input.foods,
      calories: input.calories,
      proteinGrams: input.proteinGrams,
      carbGrams: input.carbGrams,
      fatGrams: input.fatGrams,
      visibility: input.visibility,
    });
    return updated ? mapMealUsecaseToGql(updated) : null;
  }

  /**
   * Deletes a meal.
   */
  @Mutation(() => Boolean, { name: 'meal_delete' })
  @Auth(Role.ADMIN, Role.COACH)
  async meal_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteMealUsecase.execute({ id });
  }
}
