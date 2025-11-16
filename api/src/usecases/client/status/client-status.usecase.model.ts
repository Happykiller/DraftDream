// src/usecases/client/status/client-status.usecase.model.ts
export interface ClientStatusUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
