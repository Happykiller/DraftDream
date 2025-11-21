// src\usecases\session\session.usecase.dto.ts
import {
  CreateSessionDto as CreateSessionServiceDto,
  GetSessionDto as GetSessionServiceDto,
  ListSessionsDto as ListSessionsServiceDto,
  UpdateSessionDto as UpdateSessionServiceDto,
} from '@services/db/dtos/session.dto';
import type { UsecaseSession } from '@src/usecases/sport/program/program.usecase.dto';

export type CreateSessionUsecaseDto = Omit<CreateSessionServiceDto, 'slug'>;
export type GetSessionRepositoryDto = GetSessionServiceDto;
export type GetSessionUsecaseDto = GetSessionRepositoryDto & { session: UsecaseSession };
export type ListSessionsRepositoryDto = ListSessionsServiceDto;
export type ListSessionsUsecaseDto = ListSessionsRepositoryDto & { session: UsecaseSession };
export type UpdateSessionUsecaseDto = Omit<UpdateSessionServiceDto, 'slug'>;
export interface DeleteSessionUsecaseDto { id: string; session: UsecaseSession }
