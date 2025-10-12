// src/services/db/dto/tag.dto.ts
export type CreateTagDto = {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
};

export type UpdateTagDto = Partial<Pick<CreateTagDto, 'slug' | 'locale' | 'label' | 'visibility'>>;

export type GetTagDto = { id: string };

export type ListTagsDto = {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
};
