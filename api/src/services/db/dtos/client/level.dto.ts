// src/services/db/dtos/client/level.dto.ts
export interface CreateClientLevelDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export type UpdateClientLevelDto = Partial<
  Pick<CreateClientLevelDto, 'slug' | 'locale' | 'label' | 'visibility'>
>;

export interface GetClientLevelDto { id: string }

export interface ListClientLevelsDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
