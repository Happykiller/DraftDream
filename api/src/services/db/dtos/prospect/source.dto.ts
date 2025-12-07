// src/services/db/dtos/prospect/source.dto.ts
export interface CreateProspectSourceDto {
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
  slug: string;
}

export interface UpdateProspectSourceDto {
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface GetProspectSourceDto {
  id: string;
}

export interface ListProspectSourcesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
