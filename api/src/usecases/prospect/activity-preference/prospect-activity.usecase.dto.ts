// src/usecases/prospect/activity-preference/prospect-activity.usecase.dto.ts

export interface CreateProspectActivityPreferenceUsecaseDto {
    locale: string;
    label: string;
    visibility: 'private' | 'public' | 'hybrid';
    createdBy: string;
}

export interface GetProspectActivityPreferenceUsecaseDto {
    id: string;
}

export interface ListProspectActivityPreferencesUsecaseDto {
    q?: string;
    locale?: string;
    createdBy?: string;
    visibility?: 'private' | 'public';
    limit?: number;
    page?: number;
    sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateProspectActivityPreferenceUsecaseDto {
    id: string;
    locale?: string;
    label?: string;
    visibility?: 'private' | 'public';
}

export interface DeleteProspectActivityPreferenceUsecaseDto {
    id: string;
}