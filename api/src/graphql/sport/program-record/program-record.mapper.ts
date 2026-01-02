// src/graphql/sport/program-record/program-record.mapper.ts
import {
  ProgramSessionExerciseGql,
  ProgramSessionGql,
} from '@graphql/sport/program/program.gql.types';
import { ProgramRecordGql } from '@graphql/sport/program-record/program-record.gql.types';
import type {
  ProgramExerciseUsecaseModel,
  ProgramSessionUsecaseModel,
} from '@src/usecases/sport/program/program.usecase.model';
import { ProgramRecordUsecaseModel } from '@src/usecases/sport/program-record/program-record.usecase.model';

const mapExercise = (exercise: ProgramExerciseUsecaseModel): ProgramSessionExerciseGql => ({
  id: exercise.id,
  templateExerciseId: exercise.templateExerciseId ?? null,
  label: exercise.label,
  description: exercise.description ?? null,
  instructions: exercise.instructions ?? null,
  series: exercise.series ?? null,
  repetitions: exercise.repetitions ?? null,
  charge: exercise.charge ?? null,
  restSeconds: exercise.restSeconds ?? null,
  videoUrl: exercise.videoUrl ?? null,
  categoryIds: exercise.categoryIds ?? [],
  muscleIds: exercise.muscleIds ?? [],
  equipmentIds: exercise.equipmentIds ?? [],
  tagIds: exercise.tagIds ?? [],
});

const mapSession = (session?: ProgramSessionUsecaseModel | null): ProgramSessionGql | null => {
  if (!session) {
    return null;
  }

  return {
    id: session.id,
    templateSessionId: session.templateSessionId ?? null,
    slug: session.slug ?? null,
    locale: session.locale ?? null,
    label: session.label,
    durationMin: session.durationMin,
    description: session.description ?? null,
    exercises: (session.exercises ?? []).map(mapExercise),
  };
};

export const mapProgramRecordUsecaseToGql = (model: ProgramRecordUsecaseModel): ProgramRecordGql => ({
  id: model.id,
  userId: model.userId,
  programId: model.programId,
  sessionId: model.sessionId,
  sessionSnapshot: mapSession(model.sessionSnapshot ?? null),
  comment: model.comment,
  satisfactionRating: model.satisfactionRating,
  state: model.state,
  createdBy: model.createdBy,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
});
