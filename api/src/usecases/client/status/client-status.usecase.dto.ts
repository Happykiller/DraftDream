// src/usecases/client/status/client-status.usecase.dto.ts
export interface CreateClientStatusUsecaseDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export interface UpdateClientStatusUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface ListClientStatusesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
}

export interface GetClientStatusUsecaseDto { id: string }

export interface DeleteClientStatusUsecaseDto { id: string }
