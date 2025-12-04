// src/usecases/client/client/client.usecase.dto.ts
import { ProspectStatus } from '@src/common/prospect-status.enum';
import type { Role } from '@src/common/role.enum';

import { ProspectWorkflowEntryModel } from './prospect.usecase.model';

export interface UsecaseSession {
  userId: string;
  role: Role;
}

export interface CreateProspectUsecaseDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: ProspectStatus;
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
  workflowHistory?: ProspectWorkflowEntryModel[];
}

export interface UpdateProspectUsecaseDto {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: ProspectStatus;
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
  workflowHistory?: ProspectWorkflowEntryModel[];
}

export interface ListProspectsUsecaseDto {
  q?: string;
  status?: ProspectStatus;
  levelId?: string;
  sourceId?: string;
  createdBy?: string;
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

export interface GetProspectUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface DeleteProspectUsecaseDto { id: string }
