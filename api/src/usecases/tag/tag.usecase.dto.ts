// src/usecases/tag/dto/create.tag.usecase.dto.ts
export interface CreateTagUsecaseDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

// src/usecases/tag/dto/get.tag.usecase.dto.ts
export interface GetTagUsecaseDto {
  id: string;
}

// src/usecases/tag/dto/list.tags.usecase.dto.ts
export interface ListTagsUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

// src/usecases/tag/dto/update.tag.usecase.dto.ts
export interface UpdateTagUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
  visibility?: 'private' | 'public';
}

// src/usecases/tag/dto/delete.tag.usecase.dto.ts
export interface DeleteTagUsecaseDto {
  id: string;
}
