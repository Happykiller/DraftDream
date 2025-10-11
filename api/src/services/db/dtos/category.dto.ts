// src/services/db/dto/category.dto.ts
export type CreateCategoryDto = {
  slug: string;
  locale: string;
  name: string;
  visibility: 'private' | 'public';
  createdBy: string;
};

export type UpdateCategoryDto = Partial<Pick<CreateCategoryDto, 'slug' | 'locale' | 'name'>>;

export type GetCategoryDto = { id: string };

export type ListCategoriesDto = {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
};
