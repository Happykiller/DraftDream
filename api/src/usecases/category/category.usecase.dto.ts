// src/usecases/category/dto/create.category.usecase.dto.ts
export interface CreateCategoryUsecaseDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string; // comes from auth context
}

// src/usecases/category/dto/get.category.usecase.dto.ts
export interface GetCategoryUsecaseDto {
  id: string;
}

// src/usecases/category/dto/list.category.usecase.dto.ts
export interface ListCategoriesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 } // extend if needed
}

// src/usecases/category/dto/update.category.usecase.dto.ts
export interface UpdateCategoryUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
}

// src/usecases/category/dto/delete.category.usecase.dto.ts
export interface DeleteCategoryUsecaseDto {
  id: string;
}
