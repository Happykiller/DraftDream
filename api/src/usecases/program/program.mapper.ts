// src\\usecases\\program\\program.mapper.ts
import { Program, ProgramSessionSnapshot, ProgramExerciseSnapshot } from '@services/db/models/program.model';
import type {
  ProgramUsecaseModel,
  ProgramSessionUsecaseModel,
  ProgramExerciseUsecaseModel,
} from '@usecases/program/program.usecase.model';

const mapExercise = (exercise: ProgramExerciseSnapshot): ProgramExerciseUsecaseModel => ({
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
  categoryIds: exercise.categoryIds,
  muscleIds: exercise.muscleIds,
  equipmentIds: exercise.equipmentIds,
  tagIds: exercise.tagIds,
});

const mapSession = (session: ProgramSessionSnapshot): ProgramSessionUsecaseModel => ({
  id: session.id,
  templateSessionId: session.templateSessionId,
  slug: session.slug,
  locale: session.locale,
  label: session.label,
  durationMin: session.durationMin,
  description: session.description,
  exercises: (session.exercises ?? []).map(mapExercise),
});

export const mapProgramToUsecase = (program: Program): ProgramUsecaseModel => ({
  id: program.id,
  slug: program.slug,
  locale: program.locale,
  label: program.label,
  visibility: program.visibility,
  duration: program.duration,
  frequency: program.frequency,
  description: program.description,
  sessions: (program.sessions ?? []).map(mapSession),
  userId: program.userId,
  createdBy: typeof program.createdBy === 'string' ? program.createdBy : program.createdBy.id,
  deletedAt: program.deletedAt,
  createdAt: program.createdAt,
  updatedAt: program.updatedAt,
});
