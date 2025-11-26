// src/usecases/prospect/level/prospect-level.usecase.dto.ts

export interface CreateProspectLevelUsecaseDto {
    locale: string;
    label: string;
    visibility: 'private' | 'public';
    createdBy: string;
}

export interface GetProspectLevelUsecaseDto {
    id: string;
}

export interface ListProspectLevelsUsecaseDto {
    q?: string;
    locale?: string;
    createdBy?: string;
    visibility?: 'private' | 'public';
    limit?: number;
    page?: number;
    sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateProspectLevelUsecaseDto {
    id: string;
    locale?: string;
    label?: string;
    visibility?: 'private' | 'public';
}

export interface DeleteProspectLevelUsecaseDto {
    id: string;
}