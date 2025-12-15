// src/usecases/nutri/meal-type/meal-type.usecase.dto.ts

/**
 * Independent usecase DTO for creating meal types.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateMealTypeUsecaseDto {
  locale: string;
  label: string;
  icon?: string | null;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
}

export interface GetMealTypeUsecaseDto {
  id: string;
}

export interface ListMealTypesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

/**
 * Independent usecase DTO for updating meal types.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateMealTypeUsecaseDto {
  id: string;
  locale?: string;
  label?: string;
  icon?: string | null;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface DeleteMealTypeUsecaseDto {
  id: string;
}
