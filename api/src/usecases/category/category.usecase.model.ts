// src/usecases/category/model/category.usecase.model.ts
export interface CategoryUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
