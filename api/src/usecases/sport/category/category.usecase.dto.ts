// src/usecases/sport/category/category.usecase.dto.ts

/**
 * Independent usecase DTO for creating categories.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateCategoryUsecaseDto {
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
}

export interface GetCategoryUsecaseDto {
  id: string;
}

export interface ListCategoriesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;
  page?: number;
}

/**
 * Independent usecase DTO for updating categories.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateCategoryUsecaseDto {
  id: string;
  locale?: string;
  label?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

export interface DeleteCategoryUsecaseDto {
  id: string;
}
