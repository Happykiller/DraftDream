// src/graphql/exercise/exercise.resolver.ts
// Comments in English.
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  CreateExerciseInput,
  ExerciseGql,
  ExerciseListGql,
  ListExercisesInput,
  UpdateExerciseInput,
} from '@graphql/exercise/exercise.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
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
      categoryId: input.categoryId,
      primaryMuscleIds: input.primaryMuscleIds,
      secondaryMuscleIds: input.secondaryMuscleIds,
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
      categoryId: input.categoryId,
      primaryMuscleIds: input.primaryMuscleIds,
      secondaryMuscleIds: input.secondaryMuscleIds,
      equipmentIds: input.equipmentIds,
      tagIds: input.tagIds,
    });
    return updated ? mapExerciseUsecaseToGql(updated) : null;
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
      categoryId: input?.categoryId,
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
