// src/usecases/sport/program-record/program-record.mapper.ts
import { ProgramRecord } from '@services/db/models/program-record.model';

import { ProgramRecordUsecaseModel } from './program-record.usecase.model';

export const mapProgramRecordToUsecase = (record: ProgramRecord): ProgramRecordUsecaseModel => ({
  id: record.id,
  userId: record.userId,
  programId: record.programId,
  sessionId: record.sessionId,
  sessionSnapshot: record.sessionSnapshot,
  comment: record.comment,
  satisfactionRating: record.satisfactionRating,
  state: record.state,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
  deletedAt: record.deletedAt,
});
