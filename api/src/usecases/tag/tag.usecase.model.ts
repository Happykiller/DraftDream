// src/usecases/tag/model/tag.usecase.model.ts
export interface TagUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
