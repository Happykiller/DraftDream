// src\usecases\session\session.usecase.model.ts
export type SessionUsecaseModel = {
  id: string;
  slug: string;
  locale: string;

  label: string;
  durationMin: number;
  description?: string;

  exerciseIds: string[];

  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
