// src/services/db/dtos/program-record.dto.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';
import type { ProgramSessionSnapshot } from '@services/db/models/program.model';

export interface CreateProgramRecordDto {
  userId: string;
  programId: string;
  sessionId: string;
  sessionSnapshot?: ProgramSessionSnapshot;
  comment?: string;
  satisfactionRating?: number;
  state: ProgramRecordState;
  createdBy: string;
}


export interface GetProgramRecordDto {
  id: string;
}

export interface ListProgramRecordsDto {
  userId?: string;
  programId?: string;
  sessionId?: string;
  state?: ProgramRecordState;
  createdBy?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}


export interface UpdateProgramRecordDto {
  state?: ProgramRecordState;
  comment?: string;
  satisfactionRating?: number;
}
