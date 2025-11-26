// src/usecases/prospect/source/prospect-source.usecase.dto.ts

export interface CreateProspectSourceUsecaseDto {
    locale: string;
    label: string;
    visibility: 'private' | 'public';
    createdBy: string;
}

export interface GetProspectSourceUsecaseDto {
    id: string;
}

export interface ListProspectSourcesUsecaseDto {
    q?: string;
    locale?: string;
    createdBy?: string;
    visibility?: 'private' | 'public';
    limit?: number;
    page?: number;
    sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateProspectSourceUsecaseDto {
    id: string;
    locale?: string;
    label?: string;
    visibility?: 'private' | 'public';
}

export interface DeleteProspectSourceUsecaseDto {
    id: string;
}