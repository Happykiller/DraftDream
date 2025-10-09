// src\\usecases\\program\\program.mapper.ts
import { Program } from '@services/db/models/program.model';
import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

export const mapProgramToUsecase = (program: Program): ProgramUsecaseModel => ({
  id: program.id,
  name: program.name,
  duration: program.duration,
  frequency: program.frequency,
  description: program.description,
  sessionIds: [...program.sessionIds],
  userId: program.userId,
  createdBy: typeof program.createdBy === 'string' ? program.createdBy : program.createdBy.id,
  deletedAt: program.deletedAt,
  createdAt: program.createdAt,
  updatedAt: program.updatedAt,
});
