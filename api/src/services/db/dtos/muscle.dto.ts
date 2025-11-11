// src/services/db/dto/muscle.dto.ts
export interface CreateMuscleDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

export type UpdateMuscleDto = Partial<Pick<CreateMuscleDto, 'slug' | 'locale' | 'label'>>;

export interface GetMuscleDto { id: string }

export interface ListMusclesDto {
  q?: string;            // search on slug (regex)
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;        // default 20
  page?: number;         // default 1
  sort?: Record<string, 1 | -1>; // e.g. { updatedAt: -1 }
}
