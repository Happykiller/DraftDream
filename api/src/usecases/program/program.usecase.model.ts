// src\\usecases\\program\\program.usecase.model.ts
export type ProgramUsecaseModel = {
  id: string;
  name: string;
  duration: number;
  frequency: number;
  description?: string;
  sessionIds: string[];
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
