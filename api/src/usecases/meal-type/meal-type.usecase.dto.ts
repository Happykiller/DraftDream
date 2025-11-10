// src/usecases/meal-type/meal-type.usecase.dto.ts
/** Payload to create a meal type. */
export interface CreateMealTypeUsecaseDto {
  slug: string;
  locale: string;
  label: string;
  icon?: string | null;
  visibility: 'private' | 'public';
  createdBy: string;
}

/** Identifies a meal type to retrieve. */
export interface GetMealTypeUsecaseDto {
  id: string;
}

/** Filters used when listing meal types. */
export interface ListMealTypesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

/** Patch data accepted when updating a meal type. */
export interface UpdateMealTypeUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
  icon?: string | null;
  visibility?: 'private' | 'public';
}

/** Identifies a meal type to delete. */
export interface DeleteMealTypeUsecaseDto {
  id: string;
}
