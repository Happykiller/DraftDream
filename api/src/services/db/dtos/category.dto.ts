// src/services/db/dto/category.dto.ts
export interface CreateCategoryDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export type UpdateCategoryDto = Partial<Pick<CreateCategoryDto, 'slug' | 'locale' | 'label'>>;

export interface GetCategoryDto { id: string }

export interface ListCategoriesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
}
