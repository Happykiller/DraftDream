// src/usecases/tag/tag.usecase.dto.ts

/**
 * Independent usecase DTO for creating tags.
 * Decoupled from service layer - slug generation handled by use case.
 */
export interface CreateTagUsecaseDto {
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export interface GetTagUsecaseDto {
  id: string;
}

export interface ListTagsUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
}

/**
 * Independent usecase DTO for updating tags.
 * Decoupled from service layer - slug regeneration handled by use case if label changes.
 */
export interface UpdateTagUsecaseDto {
  id: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

export interface DeleteTagUsecaseDto {
  id: string;
}
