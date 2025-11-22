// src/services/db/dtos/client/client.dto.ts
import { ProspectStatusEnum } from '@graphql/prospect/prospect/prospect.enum';

export interface CreateProspectDto {
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

export type UpdateProspectDto = Partial<Omit<CreateProspectDto, 'createdBy'>>;

export interface GetProspectDto { id: string }

export interface ListProspectsDto {
  q?: string;
  status?: ProspectStatusEnum;
  levelId?: string;
  sourceId?: string;
  createdBy?: string;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
