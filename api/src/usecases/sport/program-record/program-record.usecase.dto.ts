// src/usecases/sport/program-record/program-record.usecase.dto.ts
import { ProgramRecordState } from '@src/common/program-record-state.enum';
import { Role } from '@src/common/role.enum';
import type { ProgramRecordDataUsecaseModel } from './program-record.usecase.model';

export interface UsecaseSession {
  userId: string;
  role: Role;
}

export interface CreateProgramRecordUsecaseDto {
  userId?: string;
  programId: string;
  sessionId: string;
  recordData?: ProgramRecordDataUsecaseModel;
  comment?: string;
  satisfactionRating?: number;
  durationMinutes?: number;
  difficultyRating?: number;
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
  sessionId?: string;
  state?: ProgramRecordState;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

export interface UpdateProgramRecordUsecaseDto {
  id: string;
  state: ProgramRecordState;
  recordData?: ProgramRecordDataUsecaseModel;
  comment?: string;
  satisfactionRating?: number;
  durationMinutes?: number;
  difficultyRating?: number;
  session: UsecaseSession;
}

export interface DeleteProgramRecordUsecaseDto {
  id: string;
  session: UsecaseSession;
}
