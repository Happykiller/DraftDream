// src/usecases/prospect/objective/prospect-objective.usecase.dto.ts

export interface CreateProspectObjectiveUsecaseDto {
    locale: string;
    label: string;
    visibility: 'private' | 'public' | 'hybrid';
    createdBy: string;
}

export interface GetProspectObjectiveUsecaseDto {
    id: string;
}

export interface ListProspectObjectivesUsecaseDto {
    q?: string;
    locale?: string;
    createdBy?: string;
    visibility?: 'private' | 'public';
    limit?: number;
    page?: number;
    sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateProspectObjectiveUsecaseDto {
    id: string;
    locale?: string;
    label?: string;
    visibility?: 'private' | 'public';
}

export interface DeleteProspectObjectiveUsecaseDto {
    id: string;
}