// src/usecases/client/objective/client-objective.usecase.model.ts
export interface ClientObjectiveUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
