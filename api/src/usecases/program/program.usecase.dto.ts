// src\\usecases\\program\\program.usecase.dto.ts
import {
  CreateProgramDto as CreateProgramServiceDto,
  GetProgramDto as GetProgramServiceDto,
  ListProgramsDto as ListProgramsServiceDto,
  ProgramExerciseSnapshotDto as ProgramExerciseSnapshotServiceDto,
  ProgramSessionSnapshotDto as ProgramSessionSnapshotServiceDto,
  UpdateProgramDto as UpdateProgramServiceDto,
} from '@services/db/dtos/program.dto';

export type UsecaseSessionRole = 'ADMIN' | 'COACH' | 'ATHLETE';

export type UsecaseSession = {
  userId: string;
  role: UsecaseSessionRole;
};

export type CreateProgramUsecaseDto = CreateProgramServiceDto;
export type GetProgramRepositoryDto = GetProgramServiceDto;
export type GetProgramUsecaseDto = GetProgramRepositoryDto & { session: UsecaseSession };
export type ListProgramsRepositoryDto = ListProgramsServiceDto;
export type ListProgramsUsecaseDto = ListProgramsRepositoryDto & { session: UsecaseSession };
export type UpdateProgramUsecaseDto = UpdateProgramServiceDto;
export type DeleteProgramUsecaseDto = { id: string; session: UsecaseSession };
export type ProgramSessionSnapshotUsecaseDto = ProgramSessionSnapshotServiceDto;
export type ProgramExerciseSnapshotUsecaseDto = ProgramExerciseSnapshotServiceDto;
