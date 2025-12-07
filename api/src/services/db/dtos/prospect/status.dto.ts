// src/services/db/dtos/client/status.dto.ts
export interface CreateClientStatusDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
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
  visibility?: 'PRIVATE' | 'PUBLIC';
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
