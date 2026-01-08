// src/services/db/models/program-record.model.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';
import type { ProgramSessionSnapshot } from '@services/db/models/program.model';

export interface ProgramRecordExerciseSetData {
  index: number;
  repetitions?: string;
  charge?: string;
  done?: boolean;
}

export interface ProgramRecordExerciseRecordData {
  exerciseId: string;
  notes?: string;
  sets: ProgramRecordExerciseSetData[];
}

export interface ProgramRecordData {
  exercises: ProgramRecordExerciseRecordData[];
}

export interface ProgramRecord {
  id: string;
  userId: string;
  programId: string;
  sessionId: string;
  sessionSnapshot?: ProgramSessionSnapshot;
  recordData?: ProgramRecordData;
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
