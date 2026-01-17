// src/usecases/sport/program-record/program-record.usecase.model.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';
import type { ProgramSessionUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';

export type ProgramRecordSessionSnapshotUsecaseModel = ProgramSessionUsecaseModel;

export interface ProgramRecordExerciseSetUsecaseModel {
  index: number;
  repetitions?: string;
  charge?: string;
  rpe?: number;
  done?: boolean;
}

export interface ProgramRecordExerciseRecordUsecaseModel {
  exerciseId: string;
  notes?: string;
  sets: ProgramRecordExerciseSetUsecaseModel[];
}

export interface ProgramRecordDataUsecaseModel {
  exercises: ProgramRecordExerciseRecordUsecaseModel[];
}

export interface ProgramRecordUsecaseModel {
  id: string;
  userId: string;
  programId: string;
  sessionId: string;
  sessionSnapshot?: ProgramRecordSessionSnapshotUsecaseModel;
  recordData?: ProgramRecordDataUsecaseModel;
  comment?: string;
  satisfactionRating?: number;
  durationMinutes?: number;
  difficultyRating?: number;
  state: ProgramRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
