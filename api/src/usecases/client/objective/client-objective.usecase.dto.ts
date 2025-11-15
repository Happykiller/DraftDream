// src/usecases/client/objective/client-objective.usecase.dto.ts
export interface CreateClientObjectiveUsecaseDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export interface GetClientObjectiveUsecaseDto {
  id: string;
}

export interface ListClientObjectivesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateClientObjectiveUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface DeleteClientObjectiveUsecaseDto {
  id: string;
}
