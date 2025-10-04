// src/usecases/exercise/exercise.mapper.ts
// Comments in English.
import type { Exercise } from '@services/db/models/exercise.model';
import type { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

export const mapExerciseToUsecase = (e: Exercise): ExerciseUsecaseModel => ({
  id: e.id,
  slug: e.slug,
  locale: e.locale,
  name: e.name,
  description: e.description,
  instructions: e.instructions,
  level: e.level,
  series: e.series,
  repetitions: e.repetitions,
  charge: e.charge,
  rest: e.rest,
  videoUrl: e.videoUrl,
  visibility: e.visibility,

  categoryId: e.category.id,
  primaryMuscleIds: (e.primaryMuscles ?? []).map((m) => m.id),
  secondaryMuscleIds: (e.secondaryMuscles ?? []).map((m) => m.id),
  equipmentIds: (e.equipment ?? []).map((eq) => eq.id),
  tagIds: (e.tags ?? []).map((t) => t.id),

  createdBy: typeof e.createdBy === 'string' ? e.createdBy : e.createdBy.id,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});
