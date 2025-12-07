// src/services/db/dtos/prospect/activity-preference.dto.ts
export interface CreateProspectActivityPreferenceDto {
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
  slug: string;
}

export interface UpdateProspectActivityPreferenceDto {
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface GetProspectActivityPreferenceDto {
  id: string;
}

export interface ListProspectActivityPreferencesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
