// src/usecases/athlete/athlete-info/athlete-info.usecase.dto.ts
import { Role } from '@src/common/role.enum';

export interface UsecaseSession { userId: string; role: Role }

export interface CreateAthleteInfoUsecaseDto {
  userId: string;
  levelId?: string;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string | null;
  allergies?: string | null;
  notes?: string | null;
  session: UsecaseSession;
}

export interface UpdateAthleteInfoUsecaseDto {
  id: string;
  userId?: string;
  levelId?: string | null;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string | null;
  allergies?: string | null;
  notes?: string | null;
  session: UsecaseSession;
}

export interface ListAthleteInfosUsecaseDto {
  userId?: string;
  userIds?: string[];
  createdBy?: string;
  includeArchived?: boolean;
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

export interface GetAthleteInfoUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface DeleteAthleteInfoUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface HardDeleteAthleteInfoUsecaseDto {
  id: string;
  session: UsecaseSession;
}
