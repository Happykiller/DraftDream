// src\\graphql\\program\\program.mapper.ts
import { ProgramGql, ProgramSessionGql, ProgramSessionExerciseGql } from '@graphql/program/program.gql.types';
import {
  ProgramUsecaseModel,
  ProgramSessionUsecaseModel,
  ProgramExerciseUsecaseModel,
} from '@usecases/program/program.usecase.model';

const mapExercise = (exercise: ProgramExerciseUsecaseModel): ProgramSessionExerciseGql => ({
  id: exercise.id,
  templateExerciseId: exercise.templateExerciseId,
  label: exercise.label,
  description: exercise.description,
  instructions: exercise.instructions,
  series: exercise.series,
  repetitions: exercise.repetitions,
  charge: exercise.charge,
  restSeconds: exercise.restSeconds,
  videoUrl: exercise.videoUrl,
  level: exercise.level,
  categoryIds: exercise.categoryIds,
  muscleIds: exercise.muscleIds,
  equipmentIds: exercise.equipmentIds,
  tagIds: exercise.tagIds,
});

const mapSession = (session: ProgramSessionUsecaseModel): ProgramSessionGql => ({
  id: session.id,
  templateSessionId: session.templateSessionId,
  slug: session.slug,
  locale: session.locale,
  label: session.label,
  durationMin: session.durationMin,
  description: session.description,
  exercises: (session.exercises ?? []).map(mapExercise),
});

export function mapProgramUsecaseToGql(model: ProgramUsecaseModel): ProgramGql {
  return {
    id: model.id,
    slug: model.slug,
    locale: model.locale,
    label: model.label,
    duration: model.duration,
    frequency: model.frequency,
    description: model.description,
    sessions: (model.sessions ?? []).map(mapSession),
    userId: model.userId,
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
