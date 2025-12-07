// src/usecases/exercise/exercise.usecase.dto.ts
// Comments in English.
import type { UsecaseSession } from '@src/usecases/sport/program/program.usecase.dto';

/**
 * Independent usecase DTO for creating exercises.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateExerciseUsecaseDto {
  locale: string;
  label: string;
  description?: string;
  instructions?: string;
  series: string;
  repetitions: string;
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  categoryIds: string[];
  muscleIds: string[];
  equipmentIds?: string[];
  tagIds?: string[];
  createdBy: string;
}

export interface GetExerciseUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface ListExercisesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  categoryIds?: string[];
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

/**
 * Independent usecase DTO for updating exercises.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateExerciseUsecaseDto {
  locale?: string;
  label?: string;
  description?: string;
  instructions?: string;
  series?: string;
  repetitions?: string;
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  categoryIds?: string[];
  muscleIds?: string[];
  equipmentIds?: string[];
  tagIds?: string[];
  session: UsecaseSession;
}

export interface DeleteExerciseUsecaseDto {
  id: string;
  session: UsecaseSession;
}
