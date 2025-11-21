// src/usecases/client/level/client-level.usecase.dto.ts
export interface CreateClientLevelUsecaseDto {
  slug?: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export interface UpdateClientLevelUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface ListClientLevelsUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
}

export interface GetClientLevelUsecaseDto { id: string }

export interface DeleteClientLevelUsecaseDto { id: string }
