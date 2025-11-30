// src/usecases/nutri/meal/meal.usecase.dto.ts

/**
 * Independent usecase DTO for creating meals.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateMealUsecaseDto {
  locale: string;
  label: string;
  typeId: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
}

export interface GetMealUsecaseDto {
  id: string;
}

export interface ListMealsUsecaseDto {
  q?: string;
  locale?: string;
  typeId?: string;
  createdBy?: string;
  visibility?: 'private' | 'public' | 'hybrid';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

/**
 * Independent usecase DTO for updating meals.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateMealUsecaseDto {
  id: string;
  locale?: string;
  label?: string;
  typeId?: string;
  foods?: string;
  calories?: number;
  proteinGrams?: number;
  carbGrams?: number;
  fatGrams?: number;
  visibility?: 'private' | 'public' | 'hybrid';
}

export interface DeleteMealUsecaseDto {
  id: string;
}
