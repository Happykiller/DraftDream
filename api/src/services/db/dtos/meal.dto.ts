// src/services/db/dtos/meal.dto.ts
/** Document payload used when inserting a meal. */
export interface CreateMealDto {
  slug: string;
  locale: string;
  label: string;
  typeId: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
}

/** Fields accepted when updating a meal document. */
export type UpdateMealDto = Partial<
  Pick<
    CreateMealDto,
    'slug' | 'locale' | 'label' | 'typeId' | 'foods' | 'calories' | 'proteinGrams' | 'carbGrams' | 'fatGrams' | 'visibility'
  >
>;

/** Identifier wrapper used to fetch a meal. */
export interface GetMealDto { id: string }

/** Query parameters used to list meals. */
export interface ListMealsDto {
  q?: string;
  locale?: string;
  typeId?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
}
