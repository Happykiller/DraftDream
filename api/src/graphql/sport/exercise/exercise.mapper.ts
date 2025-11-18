// src/graphql/exercise/exercise.mapper.ts
import { ExerciseUsecaseModel } from '@src/usecases/sport/exercise/exercise.usecase.model';
import { ExerciseGql, ExerciseVisibility } from '@src/graphql/sport/exercise/exercise.gql.types';

export function mapExerciseUsecaseToGql(m: ExerciseUsecaseModel): ExerciseGql {
  return {
    id: m.id,
    slug: m.slug,
    locale: m.locale,
    label: m.label,
    description: m.description,
    instructions: m.instructions,
    series: m.series,
    repetitions: m.repetitions,
    charge: m.charge,
    rest: m.rest,
    videoUrl: m.videoUrl,
    visibility: m.visibility as ExerciseVisibility,
    categoryIds: [...m.categoryIds],
    muscleIds: [...m.muscleIds],
    equipmentIds: m.equipmentIds ? [...m.equipmentIds] : undefined,
    tagIds: m.tagIds ? [...m.tagIds] : undefined,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}
