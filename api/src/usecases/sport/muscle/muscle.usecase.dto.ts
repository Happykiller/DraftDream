// src/usecases/sport/muscle/muscle.usecase.dto.ts

/**
 * Independent usecase DTO for creating muscles.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateMuscleUsecaseDto {
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export interface GetMuscleUsecaseDto {
  id: string;
}

export interface ListMusclesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

/**
 * Independent usecase DTO for updating muscles.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateMuscleUsecaseDto {
  id: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface DeleteMuscleUsecaseDto {
  id: string;
}
