// src/usecases/muscle/model/muscle.usecase.model.ts
export interface MuscleUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Unknown/Assumption: add optional fields if present in DB model (e.g., group, name)
}
