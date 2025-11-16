// src/usecases/exercise/exercise.usecase.dto.ts
// Comments in English.
import {
  CreateExerciseDto as CreateExerciseServiceDto,
  GetExerciseDto as GetExerciseServiceDto,
  ListExercisesDto as ListExercisesServiceDto,
  UpdateExerciseDto as UpdateExerciseServiceDto,
} from '@services/db/dtos/exercise.dto';
import type { UsecaseSession } from '@src/usecases/sport/program/program.usecase.dto';

export type CreateExerciseUsecaseDto = CreateExerciseServiceDto;
export type GetExerciseRepositoryDto = GetExerciseServiceDto;
export type GetExerciseUsecaseDto = GetExerciseRepositoryDto & { session: UsecaseSession };
export type ListExercisesRepositoryDto = ListExercisesServiceDto;
export type ListExercisesUsecaseDto = ListExercisesRepositoryDto & { session: UsecaseSession };
export type UpdateExerciseUsecaseDto = UpdateExerciseServiceDto & { session: UsecaseSession };

export interface ArchiveExerciseUsecaseDto { id: string }
export interface UnarchiveExerciseUsecaseDto { id: string }
export interface DeleteExerciseUsecaseDto { id: string; session: UsecaseSession }
