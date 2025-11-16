// src/services/db/dtos/client/client.dto.ts

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  statusId?: string;
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

export type UpdateClientDto = Partial<Omit<CreateClientDto, 'createdBy'>>;

export interface GetClientDto { id: string }

export interface ListClientsDto {
  q?: string;
  statusId?: string;
  levelId?: string;
  sourceId?: string;
  createdBy?: string;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
