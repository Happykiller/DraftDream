// src/services/db/dto/category.dto.ts
export interface CreateCategoryDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
}

export type UpdateCategoryDto = Partial<Pick<CreateCategoryDto, 'slug' | 'locale' | 'label' | 'visibility'>>;

export interface GetCategoryDto { id: string }

export interface ListCategoriesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
}
