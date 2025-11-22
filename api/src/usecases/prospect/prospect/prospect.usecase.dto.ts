// src/usecases/client/client/client.usecase.dto.ts
import { ProspectStatusEnum } from '@graphql/prospect/prospect/prospect.enum';

export interface CreateProspectUsecaseDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: ProspectStatusEnum;
  levelId?: string;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  sourceId?: string;
  budget?: number;
  dealDescription?: string;
  desiredStartDate?: Date;
  createdBy: string;
}

export interface UpdateProspectUsecaseDto {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: ProspectStatusEnum;
  levelId?: string;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  sourceId?: string;
  budget?: number;
  dealDescription?: string;
  desiredStartDate?: Date;
}

export interface ListProspectsUsecaseDto {
  q?: string;
  status?: ProspectStatusEnum;
  levelId?: string;
  sourceId?: string;
  createdBy?: string;
  limit?: number;
  page?: number;
}

export interface GetProspectUsecaseDto { id: string }

export interface DeleteProspectUsecaseDto { id: string }
