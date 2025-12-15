// src/services/db/dtos/prospect/level.dto.ts
export interface CreateProspectLevelDto {
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
  slug: string;
}

export interface UpdateProspectLevelDto {
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface GetProspectLevelDto {
  id: string;
}

export interface ListProspectLevelsDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
