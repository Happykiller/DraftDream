// src/graphql/meal-type/meal-type.resolver.ts
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
import inversify from '@src/inversify/investify';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  MealTypeGql,
  MealTypeListGql,
  CreateMealTypeInput,
  ListMealTypesInput,
  UpdateMealTypeInput,
} from '@graphql/meal-type/meal-type.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { mapMealTypeUsecaseToGql } from '@graphql/meal-type/meal-type.mapper';

@Resolver(() => MealTypeGql)
export class MealTypeResolver {
  /**
   * Resolves the creator field for a meal type.
   */
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() mealType: MealTypeGql): Promise<UserGql | null> {
    const userId = mealType.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  /**
   * Creates a meal type using the authenticated user as owner.
   */
  @Mutation(() => MealTypeGql, { name: 'mealType_create', nullable: true })
  @Auth(Role.ADMIN)
  async mealType_create(
    @Args('input') input: CreateMealTypeInput,
    @Context('req') req: any,
  ): Promise<MealTypeGql | null> {
    const created = await inversify.createMealTypeUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      icon: input.icon,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapMealTypeUsecaseToGql(created) : null;
  }

  /**
   * Retrieves a meal type by its identifier.
   */
  @Query(() => MealTypeGql, { name: 'mealType_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async mealType_get(@Args('id', { type: () => ID }) id: string): Promise<MealTypeGql | null> {
    const found = await inversify.getMealTypeUsecase.execute({ id });
    return found ? mapMealTypeUsecaseToGql(found) : null;
  }

  /**
   * Lists meal types with optional filtering.
   */
  @Query(() => MealTypeListGql, { name: 'mealType_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async mealType_list(
    @Args('input', { nullable: true }) input?: ListMealTypesInput,
  ): Promise<MealTypeListGql> {
    const res = await inversify.listMealTypesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility: input?.visibility,
      limit: input?.limit,
      page: input?.page,
    });

    return {
      items: res.items.map(mapMealTypeUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  /**
   * Updates a meal type by applying the provided patch.
   */
  @Mutation(() => MealTypeGql, { name: 'mealType_update', nullable: true })
  @Auth(Role.ADMIN)
  async mealType_update(
    @Args('input') input: UpdateMealTypeInput,
  ): Promise<MealTypeGql | null> {
    const updated = await inversify.updateMealTypeUsecase.execute({
      id: input.id,
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      icon: input.icon,
      visibility: input.visibility,
    });
    return updated ? mapMealTypeUsecaseToGql(updated) : null;
  }

  /**
   * Deletes a meal type.
   */
  @Mutation(() => Boolean, { name: 'mealType_delete' })
  @Auth(Role.ADMIN)
  async mealType_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteMealTypeUsecase.execute({ id });
  }
}
