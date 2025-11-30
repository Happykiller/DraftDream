// src/usecases/muscle/model/muscle.usecase.model.ts
export interface MuscleUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
