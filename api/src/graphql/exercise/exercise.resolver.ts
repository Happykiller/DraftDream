// src/graphql/exercise/exercise.resolver.ts
// Comments in English.
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '@graphql/common/ROLE';
import { Auth } from '@graphql/decorators/auth.decorator';
import { CategoryGql } from '@graphql/category/category.gql.types';
import { mapCategoryUsecaseToGql } from '@graphql/category/category.mapper';
import { EquipmentGql } from '@graphql/equipment/equipment.gql.types';
import { mapEquipmentUsecaseToGql } from '@graphql/equipment/equipment.mapper';
import {
  CreateExerciseInput,
  ExerciseGql,
  ExerciseListGql,
  ListExercisesInput,
  UpdateExerciseInput,
} from '@graphql/exercise/exercise.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { MuscleGql } from '@graphql/muscle/muscle.gql.types';
import { mapMuscleUsecaseToGql } from '@graphql/muscle/muscle.mapper';
import { TagGql } from '@graphql/tag/tag.gql.types';
import { mapTagUsecaseToGql } from '@graphql/tag/tag.mapper';
import inversify from '@src/inversify/investify';
import { mapExerciseUsecaseToGql } from '@graphql/exercise/exercise.mapper';

@Resolver(() => ExerciseGql)
export class ExerciseResolver {
  // ------- Field resolvers -------
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() exercise: ExerciseGql): Promise<UserGql | null> {
    const userId = exercise.createdBy;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => [CategoryGql], { name: 'categories' })
  async categories(@Parent() exercise: ExerciseGql): Promise<CategoryGql[]> {
    const ids = exercise.categoryIds ?? [];
    if (ids.length === 0) return [];
    const categories = await Promise.all(ids.map((id) => inversify.getCategoryUsecase.execute({ id })));
    return categories
      .filter((category): category is NonNullable<typeof category> => Boolean(category))
      .map(mapCategoryUsecaseToGql);
  }

  @ResolveField(() => [MuscleGql], { name: 'muscles' })
  async muscles(@Parent() exercise: ExerciseGql): Promise<MuscleGql[]> {
    const ids = exercise.muscleIds ?? [];
    if (!ids.length) return [];
    const muscles = await Promise.all(ids.map((id) => inversify.getMuscleUsecase.execute({ id })));
    return muscles
      .filter((muscle): muscle is NonNullable<typeof muscle> => Boolean(muscle))
      .map(mapMuscleUsecaseToGql);
  }

  @ResolveField(() => [EquipmentGql], { name: 'equipment', nullable: true })
  async equipment(@Parent() exercise: ExerciseGql): Promise<EquipmentGql[] | null> {
    const ids = exercise.equipmentIds;
    if (!ids) return null;
    if (!ids.length) return [];
    const equipment = await Promise.all(ids.map((id) => inversify.getEquipmentUsecase.execute({ id })));
    return equipment
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map(mapEquipmentUsecaseToGql);
  }

  @ResolveField(() => [TagGql], { name: 'tags', nullable: true })
  async tags(@Parent() exercise: ExerciseGql): Promise<TagGql[] | null> {
    const ids = exercise.tagIds;
    if (!ids) return null;
    if (!ids.length) return [];
    const tags = await Promise.all(ids.map((id) => inversify.getTagUsecase.execute({ id })));
    return tags
      .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag))
      .map(mapTagUsecaseToGql);
  }

  // ------- Mutations -------
  @Mutation(() => ExerciseGql, { name: 'exercise_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async exercise_create(
    @Args('input') input: CreateExerciseInput,
    @Context('req') req: any,
  ): Promise<ExerciseGql | null> {
    const created = await inversify.createExerciseUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      description: input.description,
      instructions: input.instructions,
      level: input.level,
      series: input.series,
      repetitions: input.repetitions,
      charge: input.charge,
      rest: input.rest,
      videoUrl: input.videoUrl,
      visibility: input.visibility,
      categoryIds: input.categoryIds,
      muscleIds: input.muscleIds,
      equipmentIds: input.equipmentIds,
      tagIds: input.tagIds,
      createdBy: req?.user?.id,
    });
    return created ? mapExerciseUsecaseToGql(created) : null; // null => slug déjà pris
  }

  @Mutation(() => ExerciseGql, { name: 'exercise_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async exercise_update(@Args('input') input: UpdateExerciseInput): Promise<ExerciseGql | null> {
    const updated = await inversify.updateExerciseUsecase.execute(input.id, {
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      description: input.description,
      instructions: input.instructions,
      level: input.level,
      series: input.series,
      repetitions: input.repetitions,
      charge: input.charge,
      rest: input.rest,
      videoUrl: input.videoUrl,
      visibility: input.visibility,
      categoryIds: input.categoryIds,
      muscleIds: input.muscleIds,
      equipmentIds: input.equipmentIds,
      tagIds: input.tagIds,
    });
    return mapExerciseUsecaseToGql(updated);
  }

  @Mutation(() => Boolean, { name: 'exercise_softDelete' })
  @Auth(Role.ADMIN, Role.COACH)
  async exercise_softDelete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteExerciseUsecase.execute(id);
  }

  @Mutation(() => Boolean, { name: 'exercise_delete' })
  @Auth(Role.ADMIN)
  async exercise_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteExerciseUsecase.execute(id);
  }

  // ------- Queries -------
  @Query(() => ExerciseGql, { name: 'exercise_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async exercise_get(@Args('id', { type: () => ID }) id: string): Promise<ExerciseGql | null> {
    const found = await inversify.getExerciseUsecase.execute({ id });
    return found ? mapExerciseUsecaseToGql(found) : null;
  }

  @Query(() => ExerciseListGql, { name: 'exercise_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async exercise_list(@Args('input', { nullable: true }) input?: ListExercisesInput): Promise<ExerciseListGql> {
    const res = await inversify.listExercisesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility: input?.visibility,
      level: input?.level,
      categoryIds: input?.categoryIds,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapExerciseUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }
}
