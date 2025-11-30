// src\usecases\session\session.usecase.model.ts
export interface SessionUsecaseModel {
  id: string;
  slug: string;
  locale: string;

  label: string;
  durationMin: number;
  visibility: 'private' | 'public' | 'hybrid';
  description?: string;

  exerciseIds: string[];

  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
