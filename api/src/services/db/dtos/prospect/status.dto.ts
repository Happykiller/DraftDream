// src/services/db/dtos/client/status.dto.ts
export interface CreateClientStatusDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export type UpdateClientStatusDto = Partial<
  Pick<CreateClientStatusDto, 'slug' | 'locale' | 'label' | 'visibility'>
>;

export interface GetClientStatusDto { id: string }

export interface ListClientStatusesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
