// src/services/db/dtos/client/objective.dto.ts
export interface CreateProspectObjectiveDto {
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  slug: string;
}

export interface UpdateProspectObjectiveDto {
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface GetProspectObjectiveDto { id: string }

export interface ListProspectObjectivesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
