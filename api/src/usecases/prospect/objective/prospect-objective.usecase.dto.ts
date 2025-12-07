// src/usecases/prospect/objective/prospect-objective.usecase.dto.ts

export interface CreateProspectObjectiveUsecaseDto {
    locale: string;
    label: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    createdBy: string;
}

export interface GetProspectObjectiveUsecaseDto {
    id: string;
}

export interface ListProspectObjectivesUsecaseDto {
    q?: string;
    locale?: string;
    createdBy?: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
    limit?: number;
    page?: number;
    sort?: { updatedAt?: 1 | -1 };
}

export interface UpdateProspectObjectiveUsecaseDto {
    id: string;
    locale?: string;
    label?: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface DeleteProspectObjectiveUsecaseDto {
    id: string;
}