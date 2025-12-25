// src/services/db/models/program-record.model.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';

export interface ProgramRecord {
  id: string;
  userId: string;
  programId: string;
  state: ProgramRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
