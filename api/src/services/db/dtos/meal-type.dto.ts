// src/services/db/dtos/meal-type.dto.ts
/** Document payload used when inserting a meal type. */
export interface CreateMealTypeDto {
  slug: string;
  locale: string;
  label: string;
  icon?: string | null;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
}

/** Fields accepted when updating a meal type document. */
export type UpdateMealTypeDto = Partial<
  Pick<CreateMealTypeDto, 'slug' | 'locale' | 'label' | 'icon' | 'visibility'>
>;

/** Identifier wrapper used to fetch a meal type. */
export interface GetMealTypeDto { id: string }

/** Query parameters used to list meal types. */
export interface ListMealTypesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
}
