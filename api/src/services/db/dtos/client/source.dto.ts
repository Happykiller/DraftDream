// src/services/db/dtos/client/source.dto.ts
export interface CreateClientSourceDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export type UpdateClientSourceDto = Partial<
  Pick<CreateClientSourceDto, 'slug' | 'locale' | 'label' | 'visibility'>
>;

export interface GetClientSourceDto { id: string }

export interface ListClientSourcesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
