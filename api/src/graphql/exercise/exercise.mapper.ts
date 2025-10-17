// src/graphql/exercise/exercise.mapper.ts
import { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';
import { ExerciseGql, ExerciseLevelGql, ExerciseVisibility } from '@graphql/exercise/exercise.gql.types';

export function mapExerciseUsecaseToGql(m: ExerciseUsecaseModel): ExerciseGql {
  return {
    id: m.id,
    slug: m.slug,
    locale: m.locale,
    label: m.label,
    description: m.description,
    instructions: m.instructions,
    level: m.level as ExerciseLevelGql,
    series: m.series,
    repetitions: m.repetitions,
    charge: m.charge,
    rest: m.rest,
    videoUrl: m.videoUrl,
    visibility: m.visibility as ExerciseVisibility,
    categoryId: m.categoryId,
    primaryMuscleIds: [...m.primaryMuscleIds],
    secondaryMuscleIds: m.secondaryMuscleIds ? [...m.secondaryMuscleIds] : undefined,
    equipmentIds: m.equipmentIds ? [...m.equipmentIds] : undefined,
    tagIds: m.tagIds ? [...m.tagIds] : undefined,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}
