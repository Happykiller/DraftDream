// src/usecases/prospect/level/prospect-level.usecase.dto.ts

export interface CreateProspectLevelUsecaseDto {
    locale: string;
    label: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    createdBy: string;
}

export interface GetProspectLevelUsecaseDto {
    id: string;
}

export interface ListProspectLevelsUsecaseDto {
    q?: string;
    locale?: string;
    createdBy?: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
    limit?: number;
    page?: number;
    sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateProspectLevelUsecaseDto {
    id: string;
    locale?: string;
    label?: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface DeleteProspectLevelUsecaseDto {
    id: string;
}