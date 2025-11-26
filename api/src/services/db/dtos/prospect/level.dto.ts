// src/services/db/dtos/prospect/level.dto.ts
export interface CreateProspectLevelDto {
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  slug: string;
}

export interface UpdateProspectLevelDto {
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface GetProspectLevelDto {
  id: string;
}

export interface ListProspectLevelsDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
