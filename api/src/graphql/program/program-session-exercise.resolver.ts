// src\graphql\program\program-session-exercise.resolver.ts
// Field resolvers for program session exercises.
import {
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { CategoryGql } from '@graphql/category/category.gql.types';
import { mapCategoryUsecaseToGql } from '@graphql/category/category.mapper';
import { EquipmentGql } from '@graphql/equipment/equipment.gql.types';
import { mapEquipmentUsecaseToGql } from '@graphql/equipment/equipment.mapper';
import { MuscleGql } from '@graphql/muscle/muscle.gql.types';
import { mapMuscleUsecaseToGql } from '@graphql/muscle/muscle.mapper';
import { ProgramSessionExerciseGql } from '@graphql/program/program.gql.types';
import { TagGql } from '@graphql/tag/tag.gql.types';
import { mapTagUsecaseToGql } from '@graphql/tag/tag.mapper';
import inversify from '@src/inversify/investify';

@Resolver(() => ProgramSessionExerciseGql)
export class ProgramSessionExerciseResolver {
  @ResolveField(() => [CategoryGql], { name: 'categories' })
  async categories(@Parent() exercise: ProgramSessionExerciseGql): Promise<CategoryGql[]> {
    const ids = exercise.categoryIds ?? [];
    if (!ids.length) return [];

    const categories = await Promise.all(ids.map((id) => inversify.getCategoryUsecase.execute({ id })));
    return categories
      .filter((category): category is NonNullable<typeof category> => Boolean(category))
      .map(mapCategoryUsecaseToGql);
  }

  @ResolveField(() => [MuscleGql], { name: 'muscles' })
  async muscles(@Parent() exercise: ProgramSessionExerciseGql): Promise<MuscleGql[]> {
    const ids = exercise.muscleIds ?? [];
    if (!ids.length) return [];

    const muscles = await Promise.all(ids.map((id) => inversify.getMuscleUsecase.execute({ id })));
    return muscles
      .filter((muscle): muscle is NonNullable<typeof muscle> => Boolean(muscle))
      .map(mapMuscleUsecaseToGql);
  }

  @ResolveField(() => [EquipmentGql], { name: 'equipments', nullable: true })
  async equipments(@Parent() exercise: ProgramSessionExerciseGql): Promise<EquipmentGql[] | null> {
    const ids = exercise.equipmentIds;
    if (!ids) return null;
    if (!ids.length) return [];

    const equipments = await Promise.all(ids.map((id) => inversify.getEquipmentUsecase.execute({ id })));
    return equipments
      .filter((equipment): equipment is NonNullable<typeof equipment> => Boolean(equipment))
      .map(mapEquipmentUsecaseToGql);
  }

  @ResolveField(() => [TagGql], { name: 'tags', nullable: true })
  async tags(@Parent() exercise: ProgramSessionExerciseGql): Promise<TagGql[] | null> {
    const ids = exercise.tagIds;
    if (!ids) return null;
    if (!ids.length) return [];

    const tags = await Promise.all(ids.map((id) => inversify.getTagUsecase.execute({ id })));
    return tags
      .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag))
      .map(mapTagUsecaseToGql);
  }
}
