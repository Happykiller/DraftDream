// src/graphql/tag/tag.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  CreateTagInput,
  ListTagsInput,
  TagGql,
  TagListGql,
  UpdateTagInput,
} from '@graphql/tag/tag.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapTagUsecaseToGql } from '@graphql/tag/tag.mapper';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';

@Resolver(() => TagGql)
export class TagResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() tag: TagGql): Promise<UserGql | null> {
    const userId = tag.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => TagGql, { name: 'tag_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async tag_create(
    @Args('input') input: CreateTagInput,
    @Context('req') req: any,
  ): Promise<TagGql | null> {
    const created = await inversify.createTagUsecase.execute({
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapTagUsecaseToGql(created) : null;
  }

  @Query(() => TagGql, { name: 'tag_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async tag_get(@Args('id', { type: () => ID }) id: string): Promise<TagGql | null> {
    const found = await inversify.getTagUsecase.execute({ id });
    return found ? mapTagUsecaseToGql(found) : null;
  }

  @Query(() => TagListGql, { name: 'tag_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async tag_list(@Args('input', { nullable: true }) input?: ListTagsInput): Promise<TagListGql> {
    const res = await inversify.listTagsUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility: input?.visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapTagUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => TagGql, { name: 'tag_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async tag_update(@Args('input') input: UpdateTagInput): Promise<TagGql | null> {
    const updated = await inversify.updateTagUsecase.execute({
      id: input.id,
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
    });
    return updated ? mapTagUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'tag_delete' })
  @Auth(Role.ADMIN, Role.COACH)
  async tag_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteTagUsecase.execute({ id });
  }
}
