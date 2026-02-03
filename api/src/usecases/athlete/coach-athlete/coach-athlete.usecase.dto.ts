// src/usecases/athlete/coach-athlete/coach-athlete.usecase.dto.ts

import { Role } from '@src/common/role.enum';

export interface UsecaseSession { userId: string; role: Role }

export interface CreateCoachAthleteUsecaseDto {
  coachId: string;
  athleteId: string;
  startDate: Date;
  endDate?: Date;
  is_active?: boolean;
  note?: string;
  createdBy: string;
}

export interface GetCoachAthleteUsecaseDto {
  id: string;
}

export interface ListCoachAthletesUsecaseDto {
  coachId?: string;
  athleteId?: string;
  is_active?: boolean;
  createdBy?: string;
  q?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
  session: UsecaseSession;
}

export interface UpdateCoachAthleteUsecaseDto {
  id: string;
  coachId?: string;
  athleteId?: string;
  startDate?: Date;
  endDate?: Date | null;
  is_active?: boolean;
  note?: string | null;
}

export interface DeleteCoachAthleteUsecaseDto {
  id: string;
}
