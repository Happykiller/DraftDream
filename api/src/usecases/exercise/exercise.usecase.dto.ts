// src/usecases/exercise/exercise.usecase.dto.ts
// Comments in English.
import {
  CreateExerciseDto as CreateExerciseServiceDto,
  GetExerciseDto as GetExerciseServiceDto,
  ListExercisesDto as ListExercisesServiceDto,
  UpdateExerciseDto as UpdateExerciseServiceDto,
} from '@services/db/dtos/exercise.dto';

export type CreateExerciseUsecaseDto = CreateExerciseServiceDto;
export type GetExerciseUsecaseDto = GetExerciseServiceDto;
export type ListExercisesUsecaseDto = ListExercisesServiceDto;
export type UpdateExerciseUsecaseDto = UpdateExerciseServiceDto;

export type ArchiveExerciseUsecaseDto = { id: string };
export type UnarchiveExerciseUsecaseDto = { id: string };
export type DeleteExerciseUsecaseDto = { id: string };
