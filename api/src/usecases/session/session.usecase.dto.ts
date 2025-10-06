// src\usecases\session\session.usecase.dto.ts
import {
  CreateSessionDto as CreateSessionServiceDto,
  GetSessionDto as GetSessionServiceDto,
  ListSessionsDto as ListSessionsServiceDto,
  UpdateSessionDto as UpdateSessionServiceDto,
} from '@services/db/dtos/session.dto';

export type CreateSessionUsecaseDto = CreateSessionServiceDto;
export type GetSessionUsecaseDto = GetSessionServiceDto;
export type ListSessionsUsecaseDto = ListSessionsServiceDto;
export type UpdateSessionUsecaseDto = UpdateSessionServiceDto;
export type DeleteSessionUsecaseDto = { id: string };
