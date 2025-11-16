// src/services/db/dtos/client/activity-preference.dto.ts
export interface CreateClientActivityPreferenceDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export type UpdateClientActivityPreferenceDto = Partial<
  Pick<CreateClientActivityPreferenceDto, 'slug' | 'locale' | 'label' | 'visibility'>
>;

export interface GetClientActivityPreferenceDto { id: string }

export interface ListClientActivityPreferencesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
}
