// src/graphql/sport/program-record/program-record.mapper.ts
import {
  ProgramSessionExerciseGql,
  ProgramSessionGql,
} from '@graphql/sport/program/program.gql.types';
import {
  ProgramRecordDataGql,
  ProgramRecordExerciseRecordDataGql,
  ProgramRecordExerciseSetDataGql,
  ProgramRecordGql,
} from '@graphql/sport/program-record/program-record.gql.types';
import type {
  ProgramExerciseUsecaseModel,
  ProgramSessionUsecaseModel,
} from '@src/usecases/sport/program/program.usecase.model';
import { ProgramRecordUsecaseModel } from '@src/usecases/sport/program-record/program-record.usecase.model';

const mapExercise = (exercise: ProgramExerciseUsecaseModel): ProgramSessionExerciseGql => ({
  id: exercise.id,
  templateExerciseId: exercise.templateExerciseId ?? undefined,
  label: exercise.label,
  description: exercise.description ?? undefined,
  instructions: exercise.instructions ?? undefined,
  series: exercise.series ?? undefined,
  repetitions: exercise.repetitions ?? undefined,
  charge: exercise.charge ?? undefined,
  restSeconds: exercise.restSeconds ?? undefined,
  videoUrl: exercise.videoUrl ?? undefined,
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
    templateSessionId: session.templateSessionId ?? undefined,
    slug: session.slug ?? undefined,
    locale: session.locale ?? undefined,
    label: session.label,
    durationMin: session.durationMin,
    description: session.description ?? undefined,
    exercises: (session.exercises ?? []).map(mapExercise),
  };
};

const mapExerciseSetRecord = (set: {
  index: number;
  repetitions?: string;
  charge?: string;
}): ProgramRecordExerciseSetDataGql => ({
  index: set.index,
  repetitions: set.repetitions,
  charge: set.charge,
});

const mapExerciseRecord = (exercise: {
  exerciseId: string;
  sets: { index: number; repetitions?: string; charge?: string }[];
}): ProgramRecordExerciseRecordDataGql => ({
  exerciseId: exercise.exerciseId,
  sets: exercise.sets.map(mapExerciseSetRecord),
});

const mapRecordData = (recordData?: {
  exercises: { exerciseId: string; sets: { index: number; repetitions?: string; charge?: string }[] }[];
} | null): ProgramRecordDataGql | null => {
  if (!recordData) {
    return null;
  }

  return {
    exercises: recordData.exercises.map(mapExerciseRecord),
  };
};

export const mapProgramRecordUsecaseToGql = (model: ProgramRecordUsecaseModel): ProgramRecordGql => ({
  id: model.id,
  userId: model.userId,
  programId: model.programId,
  sessionId: model.sessionId,
  sessionSnapshot: mapSession(model.sessionSnapshot ?? null),
  recordData: mapRecordData(model.recordData ?? null),
  comment: model.comment,
  satisfactionRating: model.satisfactionRating,
  state: model.state,
  createdBy: model.createdBy,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
});
