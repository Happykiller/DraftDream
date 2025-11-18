// src/usecases/client/source/client-source.usecase.dto.ts
export interface CreateClientSourceUsecaseDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export interface UpdateClientSourceUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface ListClientSourcesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
}

export interface GetClientSourceUsecaseDto { id: string }

export interface DeleteClientSourceUsecaseDto { id: string }
