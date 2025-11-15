// src/services/db/dtos/client/objective.dto.ts
export interface CreateClientObjectiveDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export type UpdateClientObjectiveDto = Partial<Pick<CreateClientObjectiveDto, 'slug' | 'locale' | 'label' | 'visibility'>>;

export interface GetClientObjectiveDto { id: string }

export interface ListClientObjectivesDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;                 // default 20
  page?: number;                  // default 1
  sort?: Record<string, 1 | -1>;  // e.g. { updatedAt: -1 }
}
