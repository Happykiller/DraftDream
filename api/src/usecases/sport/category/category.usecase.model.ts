// src/usecases/category/model/category.usecase.model.ts
export interface CategoryUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
