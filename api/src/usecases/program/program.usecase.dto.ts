// src\\usecases\\program\\program.usecase.dto.ts
import {
  CreateProgramDto as CreateProgramServiceDto,
  GetProgramDto as GetProgramServiceDto,
  ListProgramsDto as ListProgramsServiceDto,
  ProgramExerciseSnapshotDto as ProgramExerciseSnapshotServiceDto,
  ProgramSessionSnapshotDto as ProgramSessionSnapshotServiceDto,
  UpdateProgramDto as UpdateProgramServiceDto,
} from '@services/db/dtos/program.dto';

export type CreateProgramUsecaseDto = CreateProgramServiceDto;
export type GetProgramUsecaseDto = GetProgramServiceDto;
export type ListProgramsUsecaseDto = ListProgramsServiceDto;
export type UpdateProgramUsecaseDto = UpdateProgramServiceDto;
export type DeleteProgramUsecaseDto = { id: string };
export type ProgramSessionSnapshotUsecaseDto = ProgramSessionSnapshotServiceDto;
export type ProgramExerciseSnapshotUsecaseDto = ProgramExerciseSnapshotServiceDto;
