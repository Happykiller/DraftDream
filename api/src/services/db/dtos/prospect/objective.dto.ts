// src/services/db/dtos/client/objective.dto.ts
export interface CreateProspectObjectiveDto {
  locale: string;
  label: string;
  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
  slug: string;
}

export interface UpdateProspectObjectiveDto {
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public' | 'hybrid';
}

export interface GetProspectObjectiveDto { id: string }

export interface ListProspectObjectivesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public' | 'hybrid';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
