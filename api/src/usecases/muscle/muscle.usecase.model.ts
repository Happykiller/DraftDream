// src/usecases/muscle/model/muscle.usecase.model.ts
export interface MuscleUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  name: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
