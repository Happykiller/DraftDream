// src/usecases/note/note.usecase.dto.ts
import { Role } from '@src/common/role.enum';

export interface UsecaseSession { userId: string; role: Role }

export interface CreateNoteUsecaseDto {
  label: string;
  description: string;
  athleteId?: string | null;
  session: UsecaseSession;
}

export interface GetNoteUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface ListNotesUsecaseDto {
  athleteId?: string | null;
  createdBy?: string;
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

export interface UpdateNoteUsecaseDto {
  id: string;
  label?: string;
  description?: string;
  athleteId?: string | null;
  session: UsecaseSession;
}

export interface DeleteNoteUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface HardDeleteNoteUsecaseDto {
  id: string;
  session: UsecaseSession;
}
