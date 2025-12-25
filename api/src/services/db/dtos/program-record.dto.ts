// src/services/db/dtos/program-record.dto.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';

export interface CreateProgramRecordDto {
  userId: string;
  programId: string;
  state: ProgramRecordState;
  createdBy: string;
}

export interface GetProgramRecordDto {
  id: string;
}

export interface ListProgramRecordsDto {
  userId?: string;
  programId?: string;
  state?: ProgramRecordState;
  createdBy?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
}

export interface UpdateProgramRecordDto {
  state?: ProgramRecordState;
}
