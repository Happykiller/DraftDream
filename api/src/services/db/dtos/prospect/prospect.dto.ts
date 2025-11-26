// src/services/db/dtos/client/client.dto.ts
import { ProspectStatus } from '@src/common/prospect-status.enum';

export interface CreateProspectDto {
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
}

export type UpdateProspectDto = Partial<Omit<CreateProspectDto, 'createdBy'>>;

export interface GetProspectDto { id: string }

export interface ListProspectsDto {
  q?: string;
  status?: ProspectStatus;
  levelId?: string;
  sourceId?: string;
  createdBy?: string;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
