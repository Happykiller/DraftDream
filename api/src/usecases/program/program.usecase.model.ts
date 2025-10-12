// src\\usecases\\program\\program.usecase.model.ts
export type ProgramUsecaseModel = {
  id: string;
  slug: string;
  locale: string;
  label: string;
  duration: number;
  frequency: number;
  description?: string;
  sessionIds: string[];
  userId?: string;
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
