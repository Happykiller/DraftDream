// src/usecases/category/model/category.usecase.model.ts
export interface CategoryUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
