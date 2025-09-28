// src/graphql/category/category.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  CategoryGql,
  CategoryListGql,
  CreateCategoryInput,
  ListCategoriesInput,
  UpdateCategoryInput,
} from '@graphql/category/category.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { mapCategoryUsecaseToGql } from '@graphql/category/category.mapper';

@Resolver(() => CategoryGql)
export class CategoryResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() category: CategoryGql): Promise<UserGql | null> {
    const userId = category.createdBy;
    if (!userId) return null;

    // Appelle ton use case/service domaine
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  // CREATE
  @Mutation(() => CategoryGql, { name: 'category_create', nullable: true })
  @Auth(Role.ADMIN)
  async category_create(
    @Args('input') input: CreateCategoryInput,
    @Context('req') req: any,
  ): Promise<CategoryGql | null> {
    const created = await inversify.createCategoryUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      visibility: input.visibility,
      createdBy: req?.user?.id, // assumes auth guard fills req.user
    });
    return created ? mapCategoryUsecaseToGql(created) : null;
  }

  // GET
  @Query(() => CategoryGql, { name: 'category_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async category_get(@Args('id', { type: () => ID }) id: string): Promise<CategoryGql | null> {
    const found = await inversify.getCategoryUsecase.execute({ id });
    return found ? mapCategoryUsecaseToGql(found) : null;
  }

  // LIST
  @Query(() => CategoryListGql, { name: 'category_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async category_list(
    @Args('input', { nullable: true }) input?: ListCategoriesInput,
  ): Promise<CategoryListGql> {
    const res = await inversify.listCategoriesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility: input?.visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapCategoryUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  // UPDATE
  @Mutation(() => CategoryGql, { name: 'category_update', nullable: true })
  @Auth(Role.ADMIN)
  async category_update(
    @Args('input') input: UpdateCategoryInput,
  ): Promise<CategoryGql | null> {
    const updated = await inversify.updateCategoryUsecase.execute({
      id: input.id,
      slug: input.slug,
      locale: input.locale,
    });
    return updated ? mapCategoryUsecaseToGql(updated) : null;
  }

  // DELETE
  @Mutation(() => Boolean, { name: 'category_delete' })
  @Auth(Role.ADMIN)
  async category_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteCategoryUsecase.execute({ id });
  }
}
