// src/usecases/sport/program-record/program-record.usecase.dto.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';
import { Role } from '@src/common/role.enum';

export interface UsecaseSession {
  userId: string;
  role: Role;
}

export interface CreateProgramRecordUsecaseDto {
  userId?: string;
  programId: string;
  state?: ProgramRecordState;
  session: UsecaseSession;
}

export interface GetProgramRecordUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface ListProgramRecordsUsecaseDto {
  userId?: string;
  programId?: string;
  state?: ProgramRecordState;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

export interface UpdateProgramRecordUsecaseDto {
  id: string;
  state: ProgramRecordState;
  session: UsecaseSession;
}
