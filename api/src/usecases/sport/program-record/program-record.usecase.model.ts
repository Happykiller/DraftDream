// src/usecases/sport/program-record/program-record.usecase.model.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';

export interface ProgramRecordUsecaseModel {
  id: string;
  userId: string;
  programId: string;
  sessionId: string;
  comment?: string;
  satisfactionRating?: number;
  state: ProgramRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
