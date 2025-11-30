// src/services/db/dto/tag.dto.ts
export interface CreateTagDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
}

export type UpdateTagDto = Partial<Pick<CreateTagDto, 'slug' | 'locale' | 'label' | 'visibility'>>;

export interface GetTagDto { id: string }

export interface ListTagsDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public' | 'hybrid';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
}
