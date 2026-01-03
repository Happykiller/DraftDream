// src/usecases/sport/program-record/program-record.mapper.ts
import { ProgramRecord } from '@services/db/models/program-record.model';

import { ProgramRecordUsecaseModel } from './program-record.usecase.model';

export const mapProgramRecordToUsecase = (record: ProgramRecord): ProgramRecordUsecaseModel => ({
  id: record.id,
  userId: record.userId,
  programId: record.programId,
  sessionId: record.sessionId,
  sessionSnapshot: record.sessionSnapshot,
  recordData: record.recordData
    ? {
      exercises: record.recordData.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        notes: exercise.notes,
        sets: exercise.sets.map((set) => ({
          index: set.index,
          repetitions: set.repetitions,
          charge: set.charge,
          done: set.done,
        })),
      })),
    }
    : undefined,
  comment: record.comment,
  satisfactionRating: record.satisfactionRating,
  durationMinutes: record.durationMinutes,
  difficultyRating: record.difficultyRating,
  state: record.state,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
  deletedAt: record.deletedAt,
});
