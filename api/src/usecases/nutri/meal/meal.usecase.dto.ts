// src/usecases/meal/meal.usecase.dto.ts
/** Payload used to create a meal. */
export interface CreateMealUsecaseDto {
  locale: string;
  label: string;
  typeId: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  visibility: 'private' | 'public';
  createdBy: string;
}

/** Identifies a meal to retrieve. */
export interface GetMealUsecaseDto {
  id: string;
}

/** Filters used when listing meals. */
export interface ListMealsUsecaseDto {
  q?: string;
  locale?: string;
  typeId?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

/** Patch data accepted when updating a meal. */
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
  visibility?: 'private' | 'public';
}

/** Identifies a meal to delete. */
export interface DeleteMealUsecaseDto {
  id: string;
}
