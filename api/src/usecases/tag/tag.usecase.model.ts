// src/usecases/tag/model/tag.usecase.model.ts
export interface TagUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
