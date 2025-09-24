// src/services/db/dto/muscle.dto.ts
export type CreateMuscleDto = {
  slug: string;
  locale: string;
  createdBy: string;
};

export type UpdateMuscleDto = Partial<Pick<CreateMuscleDto, 'slug' | 'locale'>>;

export type GetMuscleDto = { id: string };

export type ListMusclesDto = {
  q?: string;            // search on slug (regex)
  locale?: string;
  createdBy?: string;
  limit?: number;        // default 20
  page?: number;         // default 1
  sort?: Record<string, 1 | -1>; // e.g. { updatedAt: -1 }
};
