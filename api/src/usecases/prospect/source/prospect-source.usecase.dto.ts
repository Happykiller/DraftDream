// src/usecases/prospect/source/prospect-source.usecase.dto.ts

export interface CreateProspectSourceUsecaseDto {
    locale: string;
    label: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    createdBy: string;
}

export interface GetProspectSourceUsecaseDto {
    id: string;
}

export interface ListProspectSourcesUsecaseDto {
    q?: string;
    locale?: string;
    createdBy?: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
    limit?: number;
    page?: number;
    sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateProspectSourceUsecaseDto {
    id: string;
    locale?: string;
    label?: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface DeleteProspectSourceUsecaseDto {
    id: string;
}