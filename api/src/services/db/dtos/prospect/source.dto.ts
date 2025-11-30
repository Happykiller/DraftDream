// src/services/db/dtos/prospect/source.dto.ts
export interface CreateProspectSourceDto {
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  slug: string;
}

export interface UpdateProspectSourceDto {
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface GetProspectSourceDto {
  id: string;
}

export interface ListProspectSourcesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
