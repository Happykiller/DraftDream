// src/usecases/client/source/client-source.usecase.model.ts
export interface ClientSourceUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
