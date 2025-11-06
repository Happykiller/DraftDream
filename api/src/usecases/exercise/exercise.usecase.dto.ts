// src/usecases/exercise/exercise.usecase.dto.ts
// Comments in English.
import {
  CreateExerciseDto as CreateExerciseServiceDto,
  GetExerciseDto as GetExerciseServiceDto,
  ListExercisesDto as ListExercisesServiceDto,
  UpdateExerciseDto as UpdateExerciseServiceDto,
} from '@services/db/dtos/exercise.dto';
import type { UsecaseSession } from '@usecases/program/program.usecase.dto';

export type CreateExerciseUsecaseDto = CreateExerciseServiceDto;
export type GetExerciseRepositoryDto = GetExerciseServiceDto;
export type GetExerciseUsecaseDto = GetExerciseRepositoryDto & { session: UsecaseSession };
export type ListExercisesRepositoryDto = ListExercisesServiceDto;
export type ListExercisesUsecaseDto = ListExercisesRepositoryDto & { session: UsecaseSession };
export type UpdateExerciseUsecaseDto = UpdateExerciseServiceDto & { session: UsecaseSession };

export type ArchiveExerciseUsecaseDto = { id: string };
export type UnarchiveExerciseUsecaseDto = { id: string };
export type DeleteExerciseUsecaseDto = { id: string; session: UsecaseSession };
