// src/usecases/client/activity-preference/client-activity-preference.usecase.dto.ts
export interface CreateClientActivityPreferenceUsecaseDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export interface UpdateClientActivityPreferenceUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface ListClientActivityPreferencesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
}

export interface GetClientActivityPreferenceUsecaseDto { id: string }

export interface DeleteClientActivityPreferenceUsecaseDto { id: string }
