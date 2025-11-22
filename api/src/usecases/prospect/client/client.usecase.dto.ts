// src/usecases/client/client/client.usecase.dto.ts

export interface CreateClientUsecaseDto {
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

export interface UpdateClientUsecaseDto {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
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
}

export interface ListClientsUsecaseDto {
  q?: string;
  statusId?: string;
  levelId?: string;
  sourceId?: string;
  createdBy?: string;
  limit?: number;
  page?: number;
}

export interface GetClientUsecaseDto { id: string }

export interface DeleteClientUsecaseDto { id: string }
