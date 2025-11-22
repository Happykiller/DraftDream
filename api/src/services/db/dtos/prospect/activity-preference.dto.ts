// src/services/db/dtos/prospect/activity-preference.dto.ts
export interface CreateProspectActivityPreferenceDto {
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  slug: string;
}

export interface UpdateProspectActivityPreferenceDto {
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface GetProspectActivityPreferenceDto {
  id: string;
}

export interface ListProspectActivityPreferencesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
