// src\services\db\dtos\session.dto.ts
export type Visibility = 'private' | 'public' | 'hybrid';

export interface CreateSessionDto {
  slug: string;
  locale: string;

  label: string;
  durationMin: number;
  visibility?: Visibility;
  description?: string;

  /** Ordered list of exercise IDs (order by array index). */
  exerciseIds: string[];

  createdBy: string;
}

export interface GetSessionDto { id: string }

export interface ListSessionsDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  createdByIn?: string[];
  includePublicVisibility?: boolean;
  includeArchived?: boolean; // default false (exclude deleted items)
  limit?: number;            // default 20
  page?: number;             // default 1
  sort?: Record<string, 1 | -1>; // default { updatedAt: -1 }
}

export type UpdateSessionDto = Partial<{
  slug: string;
  locale: string;

  label: string;
  durationMin: number;
  visibility: Visibility;
  description: string;

  /** Replace the whole ordered list */
  exerciseIds: string[];
}>;
