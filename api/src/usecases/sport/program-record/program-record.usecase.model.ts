// src/usecases/sport/program-record/program-record.usecase.model.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';
import type { ProgramSessionUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';

export type ProgramRecordSessionSnapshotUsecaseModel = ProgramSessionUsecaseModel;

export interface ProgramRecordUsecaseModel {
  id: string;
  userId: string;
  programId: string;
  sessionId: string;
  sessionSnapshot?: ProgramRecordSessionSnapshotUsecaseModel;
  comment?: string;
  satisfactionRating?: number;
  state: ProgramRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
